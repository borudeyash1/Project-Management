import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Square,
    Circle,
    Minus,
    Type as TextIcon,
    Paintbrush,
    Eraser,
    Download,
    Upload,
    Undo,
    Redo,
    Trash2,
    Move,
    Image as ImageIcon,
    Crop
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

interface BannerCanvasEditorProps {
    width?: number;
    height?: number;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundType?: 'color' | 'image' | 'transparent' | 'gradient';
    initialText?: string;
    initialImage?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: number;
    fontFamily?: string;
    padding?: number;
    borderRadius?: number;
    brushSize?: number;
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    onExport?: (dataUrl: string) => void;
    onContentChange?: (elements: DrawingElement[]) => void;
}

export interface BannerCanvasEditorRef {
    triggerExport: () => void;
}

type Tool = 'select' | 'line' | 'rectangle' | 'circle' | 'text' | 'pen' | 'eraser';
type BackgroundType = 'color' | 'image' | 'transparent' | 'gradient';

interface DrawingElement {
    type: 'line' | 'rectangle' | 'circle' | 'text' | 'path' | 'image';
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    x2?: number;
    y2?: number;
    text?: string;
    color: string;
    strokeWidth: number;
    points?: { x: number; y: number }[];
    imageData?: string;
    isDraggable?: boolean;
    fontSize?: number;
    fontWeight?: number;
    fontFamily?: string;
}

const BannerCanvasEditor = forwardRef<BannerCanvasEditorRef, BannerCanvasEditorProps>((props, ref) => {
    const {
        width = 800,
        height = 400,
        backgroundColor = '#ffffff',
        backgroundImage,
        backgroundType: initialBackgroundType = 'color',
        initialText,
        initialImage,
        textColor = '#000000',
        fontSize = 24,
        fontWeight = 400,
        fontFamily = 'Arial',
        padding = 0,
        borderRadius = 0,
        brushSize = 5,
        gradientStart = '#ffffff',
        gradientEnd = '#000000',
        gradientDirection = 'to right',
        onExport,
        onContentChange
    } = props;
    const { isDarkMode } = useTheme();
    const { addToast } = useApp();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageCache = useRef<{ [key: string]: HTMLImageElement }>({});
    const [imagesLoaded, setImagesLoaded] = useState(0); // Force re-render when images load
    const [tool, setTool] = useState<Tool>('select');
    const [color, setColor] = useState(textColor);
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [elements, setElements] = useState<DrawingElement[]>([]);
    const [history, setHistory] = useState<DrawingElement[][]>([]);
    const [historyStep, setHistoryStep] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
    const [selectedElement, setSelectedElement] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
    const [backgroundType, setBackgroundType] = useState<BackgroundType>(initialBackgroundType);
    const [bgColor, setBgColor] = useState(backgroundColor);
    const [bgImage, setBgImage] = useState(backgroundImage || '');
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [cropMode, setCropMode] = useState(false);
    const [cropBounds, setCropBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [editingText, setEditingText] = useState<number | null>(null);
    const [editingTextValue, setEditingTextValue] = useState('');
    const [cursorStyle, setCursorStyle] = useState('default');
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    // Initialize with banner content
    useEffect(() => {
        const initialElements: DrawingElement[] = [];

        if (initialText) {
            initialElements.push({
                type: 'text',
                x: width / 2,
                y: height / 2,
                text: initialText,
                color: textColor,
                strokeWidth: Math.floor(fontSize / 8),
                fontSize: fontSize,
                fontWeight: fontWeight,
                isDraggable: true
            });
        }

        if (initialImage) {
            // Load image to get dimensions and scale it
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const scaled = scaleImageToFit(img.width, img.height, width, height);
                initialElements.push({
                    type: 'image',
                    x: (width - scaled.width) / 2,
                    y: (height - scaled.height) / 2,
                    width: scaled.width,
                    height: scaled.height,
                    imageData: initialImage,
                    color: '#000000',
                    strokeWidth: 0,
                    isDraggable: true
                });
                setElements(initialElements);
                setHistory([initialElements]);
                setHistoryStep(0);
            };
            img.src = initialImage;
        } else if (initialElements.length > 0) {
            setElements(initialElements);
            setHistory([initialElements]);
            setHistoryStep(0);
        }
    }, [initialText, initialImage]); // Run only on mount/initial prop change

    // Sync props with canvas state
    useEffect(() => {
        setBgColor(backgroundColor);
    }, [backgroundColor]);

    // Sync textColor to selected element
    useEffect(() => {
        if (selectedElement !== null) {
            setElements(prev => prev.map((el, index) =>
                index === selectedElement && el.type === 'text' ? { ...el, color: textColor } : el
            ));
        }
    }, [textColor, selectedElement]);

    // Sync fontSize to selected element
    useEffect(() => {
        if (selectedElement !== null) {
            setElements(prev => prev.map((el, index) =>
                index === selectedElement && el.type === 'text' ? { ...el, fontSize: fontSize, strokeWidth: Math.floor((fontSize || 24) / 8) } : el
            ));
        }
    }, [fontSize, selectedElement]);

    // Sync fontWeight to selected element
    useEffect(() => {
        if (selectedElement !== null) {
            setElements(prev => prev.map((el, index) =>
                index === selectedElement && el.type === 'text' ? { ...el, fontWeight: fontWeight } : el
            ));
        }
    }, [fontWeight, selectedElement]);

    useEffect(() => {
        redraw();
        if (onContentChange) {
            onContentChange(elements);
        }
    }, [elements, bgColor, bgImage, backgroundType, borderRadius, width, height]);

    const redraw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        // Apply border radius clipping
        if (borderRadius && borderRadius > 0) {
            ctx.save();
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(0, 0, width, height, borderRadius);
            } else {
                // Fallback for browsers that don't support roundRect
                ctx.rect(0, 0, width, height);
            }
            ctx.clip();
        }

        // Draw background
        if (backgroundType === 'color') {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
        } else if (backgroundType === 'gradient') {
            let grad;
            switch (gradientDirection) {
                case 'to right':
                    grad = ctx.createLinearGradient(0, 0, width, 0);
                    break;
                case 'to bottom':
                    grad = ctx.createLinearGradient(0, 0, 0, height);
                    break;
                case 'to bottom right':
                    grad = ctx.createLinearGradient(0, 0, width, height);
                    break;
                case 'to top right':
                    grad = ctx.createLinearGradient(0, height, width, 0);
                    break;
                default:
                    grad = ctx.createLinearGradient(0, 0, width, 0);
            }
            grad.addColorStop(0, gradientStart);
            grad.addColorStop(1, gradientEnd);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        } else if (backgroundType === 'image' && bgImage) {
            let img = imageCache.current[bgImage];
            if (!img) {
                img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = bgImage;
                img.onload = () => setImagesLoaded(prev => prev + 1);
                imageCache.current[bgImage] = img;
            }

            if (img.complete) {
                // TODO: Implement background image transforms (x, y, scale)
                ctx.drawImage(img, 0, 0, width, height);
            }
        }

        drawElements(ctx);

        // Restore clipping
        if (borderRadius && borderRadius > 0) {
            ctx.restore();
        }
    };

    const drawElements = (ctx: CanvasRenderingContext2D) => {
        elements.forEach((element, index) => {
            ctx.strokeStyle = element.color;
            ctx.fillStyle = element.color;
            ctx.lineWidth = element.strokeWidth;

            if (index === selectedElement && tool === 'select') {
                ctx.save();
                ctx.strokeStyle = '#FFC107';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
            }

            switch (element.type) {
                case 'line':
                    if (element.x2 !== undefined && element.y2 !== undefined) {
                        ctx.beginPath();
                        ctx.moveTo(element.x, element.y);
                        ctx.lineTo(element.x2, element.y2);
                        ctx.stroke();
                    }
                    break;

                case 'rectangle':
                    if (element.width && element.height) {
                        ctx.strokeRect(element.x, element.y, element.width, element.height);
                    }
                    break;

                case 'circle':
                    if (element.radius) {
                        ctx.beginPath();
                        ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
                        ctx.stroke();
                    }
                    break;

                case 'text':
                    if (element.text) {
                        const textSize = element.fontSize || fontSize || 24;
                        const weight = element.fontWeight || fontWeight || 400;
                        const font = element.fontFamily || fontFamily || 'Arial';
                        ctx.font = `${weight} ${textSize}px ${font}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(element.text, element.x, element.y);

                        if (index === selectedElement && tool === 'select') {
                            const metrics = ctx.measureText(element.text);
                            const textWidth = metrics.width;
                            const textHeight = textSize;
                            ctx.strokeRect(
                                element.x - textWidth / 2 - 5,
                                element.y - textHeight / 2 - 5,
                                textWidth + 10,
                                textHeight + 10
                            );
                        }
                    }
                    break;

                case 'path':
                    if (element.points && element.points.length > 1) {
                        ctx.beginPath();
                        ctx.moveTo(element.points[0].x, element.points[0].y);
                        element.points.forEach(point => {
                            ctx.lineTo(point.x, point.y);
                        });
                        ctx.stroke();
                    }
                    break;

                case 'image':
                    if (element.imageData && element.width !== undefined && element.height !== undefined) {
                        let img = imageCache.current[element.imageData];
                        if (!img) {
                            img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.src = element.imageData;
                            img.onload = () => setImagesLoaded(prev => prev + 1);
                            imageCache.current[element.imageData] = img;
                        }

                        if (img.complete) {
                            ctx.drawImage(img, element.x, element.y, element.width, element.height);
                        }

                        if (index === selectedElement && tool === 'select') {
                            ctx.strokeRect(element.x, element.y, element.width, element.height);
                        }
                    }
                    break;
            }

            if (index === selectedElement && tool === 'select') {
                ctx.restore();
                drawResizeHandles(ctx, element);
            }
        });

        // Draw crop overlay if in crop mode
        if (cropMode && cropBounds && selectedElement !== null) {
            const element = elements[selectedElement];
            if (element.type === 'image') {
                // Darken everything outside crop bounds
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, width, height);
                ctx.clearRect(cropBounds.x, cropBounds.y, cropBounds.width, cropBounds.height);

                // Draw crop rectangle
                ctx.strokeStyle = '#FFC107';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(cropBounds.x, cropBounds.y, cropBounds.width, cropBounds.height);
                ctx.setLineDash([]);
            }
        }
    };

    // Helper function to scale image to fit canvas while maintaining aspect ratio
    const scaleImageToFit = (imgWidth: number, imgHeight: number, canvasWidth: number, canvasHeight: number) => {
        const maxWidth = canvasWidth * 0.8; // Use 80% of canvas width
        const maxHeight = canvasHeight * 0.8; // Use 80% of canvas height

        let width = imgWidth;
        let height = imgHeight;

        // Scale down if image is larger than max dimensions
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio, 1); // Don't scale up, only down

        width = width * ratio;
        height = height * ratio;

        return { width, height };
    };

    const drawResizeHandles = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
        const handleSize = 8;
        let bounds = { x: 0, y: 0, width: 0, height: 0 };

        if (element.type === 'text' && element.text) {
            const textSize = element.fontSize || fontSize || 24;
            const weight = element.fontWeight || fontWeight || 400;
            ctx.font = `${weight} ${textSize}px Arial`;
            const metrics = ctx.measureText(element.text);
            const textWidth = metrics.width;
            const textHeight = textSize;
            bounds = {
                x: element.x - textWidth / 2,
                y: element.y - textHeight / 2,
                width: textWidth,
                height: textHeight
            };
        } else if (element.type === 'image' && element.width && element.height) {
            bounds = {
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height
            };
        } else {
            return;
        }

        const handles = [
            { x: bounds.x, y: bounds.y, cursor: 'nw' },
            { x: bounds.x + bounds.width / 2, y: bounds.y, cursor: 'n' },
            { x: bounds.x + bounds.width, y: bounds.y, cursor: 'ne' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, cursor: 'e' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: 'se' },
            { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, cursor: 's' },
            { x: bounds.x, y: bounds.y + bounds.height, cursor: 'sw' },
            { x: bounds.x, y: bounds.y + bounds.height / 2, cursor: 'w' },
        ];

        ctx.fillStyle = '#FFC107';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);

        handles.forEach(handle => {
            ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
            ctx.strokeRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const findElementAtPosition = (x: number, y: number): number | null => {
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];

            if (el.type === 'text' && el.text) {
                const canvas = canvasRef.current;
                if (!canvas) continue;
                const ctx = canvas.getContext('2d');
                if (!ctx) continue;
                const textSize = el.fontSize || fontSize || 24;
                const weight = el.fontWeight || fontWeight || 400;
                const font = el.fontFamily || fontFamily || 'Arial';
                ctx.font = `${weight} ${textSize}px ${font}`;
                const metrics = ctx.measureText(el.text);
                const textWidth = metrics.width;
                const textHeight = textSize;

                if (x >= el.x - textWidth / 2 && x <= el.x + textWidth / 2 &&
                    y >= el.y - textHeight / 2 && y <= el.y + textHeight / 2) {
                    return i;
                }
            } else if (el.type === 'image' && el.width && el.height) {
                if (x >= el.x && x <= el.x + el.width &&
                    y >= el.y && y <= el.y + el.height) {
                    return i;
                }
            }
        }
        return null;
    };

    const findResizeHandle = (x: number, y: number, element: DrawingElement): string | null => {
        const handleSize = 8;
        let bounds = { x: 0, y: 0, width: 0, height: 0 };

        if (element.type === 'text' && element.text) {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            const textSize = element.fontSize || fontSize || 24;
            const weight = element.fontWeight || fontWeight || 400;
            ctx.font = `${weight} ${textSize}px Arial`;
            const metrics = ctx.measureText(element.text);
            const textWidth = metrics.width;
            const textHeight = textSize;
            bounds = {
                x: element.x - textWidth / 2,
                y: element.y - textHeight / 2,
                width: textWidth,
                height: textHeight
            };
        } else if (element.type === 'image' && element.width && element.height) {
            bounds = {
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height
            };
        } else {
            return null;
        }

        const handles = [
            { x: bounds.x, y: bounds.y, type: 'nw' },
            { x: bounds.x + bounds.width / 2, y: bounds.y, type: 'n' },
            { x: bounds.x + bounds.width, y: bounds.y, type: 'ne' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, type: 'e' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'se' },
            { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, type: 's' },
            { x: bounds.x, y: bounds.y + bounds.height, type: 'sw' },
            { x: bounds.x, y: bounds.y + bounds.height / 2, type: 'w' },
        ];

        for (const handle of handles) {
            if (Math.abs(x - handle.x) <= handleSize && Math.abs(y - handle.y) <= handleSize) {
                return handle.type;
            }
        }

        return null;
    };

    // Get cursor style based on resize handle
    const getCursorStyle = (handleType: string | null): string => {
        if (!handleType) return 'default';
        const cursorMap: { [key: string]: string } = {
            'nw': 'nw-resize',
            'n': 'n-resize',
            'ne': 'ne-resize',
            'e': 'e-resize',
            'se': 'se-resize',
            's': 's-resize',
            'sw': 'sw-resize',
            'w': 'w-resize'
        };
        return cursorMap[handleType] || 'default';
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        setIsDrawing(true);
        setStartPos(pos);

        if (tool === 'select') {
            if (selectedElement !== null && elements[selectedElement]) {
                const element = elements[selectedElement];
                const handle = findResizeHandle(pos.x, pos.y, element);

                if (handle) {
                    setResizeHandle(handle);
                    if (element.type === 'image' && element.width && element.height) {
                        setResizeStart({
                            x: element.x,
                            y: element.y,
                            width: element.width,
                            height: element.height
                        });
                    } else if (element.type === 'text') {
                        const textSize = element.fontSize || fontSize || 24;
                        setResizeStart({
                            x: element.x,
                            y: element.y,
                            width: textSize,
                            height: textSize
                        });
                    }
                    return;
                }
            }

            const elementIndex = findElementAtPosition(pos.x, pos.y);
            setSelectedElement(elementIndex);

            if (elementIndex !== null && elements[elementIndex]) {
                const el = elements[elementIndex];
                setDragOffset({
                    x: pos.x - el.x,
                    y: pos.y - el.y
                });
            }
        } else if (tool === 'pen' || tool === 'eraser') {
            setCurrentPath([pos]);
        } else if (cropMode && selectedElement !== null && elements[selectedElement]) {
            const element = elements[selectedElement];
            if (element.type === 'image') {
                setCropBounds({
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0
                });
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        setMousePos(pos);

        // Update cursor based on hover state
        if (tool === 'select' && selectedElement !== null && !isDrawing && elements[selectedElement]) {
            const element = elements[selectedElement];
            const handle = findResizeHandle(pos.x, pos.y, element);
            const newCursor = handle ? getCursorStyle(handle) : 'move';
            if (cursorStyle !== newCursor) {
                setCursorStyle(newCursor);
            }
        } else if (!isDrawing) {
            if (tool === 'pen' || tool === 'eraser') {
                // Custom cursor for pen/eraser
                if (cursorStyle !== 'none') setCursorStyle('none');
            } else if (cursorStyle !== 'default') {
                setCursorStyle('default');
            }
        }

        if (!isDrawing || !startPos) return;

        if (tool === 'select' && resizeHandle && selectedElement !== null && resizeStart && elements[selectedElement]) {
            const element = elements[selectedElement];
            const newElements = [...elements];
            const dx = pos.x - startPos.x;
            const dy = pos.y - startPos.y;

            if (element.type === 'image' && element.width && element.height) {
                let newWidth = resizeStart.width;
                let newHeight = resizeStart.height;
                let newX = resizeStart.x;
                let newY = resizeStart.y;

                switch (resizeHandle) {
                    case 'se':
                        newWidth = resizeStart.width + dx;
                        newHeight = resizeStart.height + dy;
                        break;
                    case 'sw':
                        newWidth = resizeStart.width - dx;
                        newHeight = resizeStart.height + dy;
                        newX = resizeStart.x + dx;
                        break;
                    case 'ne':
                        newWidth = resizeStart.width + dx;
                        newHeight = resizeStart.height - dy;
                        newY = resizeStart.y + dy;
                        break;
                    case 'nw':
                        newWidth = resizeStart.width - dx;
                        newHeight = resizeStart.height - dy;
                        newX = resizeStart.x + dx;
                        newY = resizeStart.y + dy;
                        break;
                    case 'e':
                        newWidth = resizeStart.width + dx;
                        break;
                    case 'w':
                        newWidth = resizeStart.width - dx;
                        newX = resizeStart.x + dx;
                        break;
                    case 'n':
                        newHeight = resizeStart.height - dy;
                        newY = resizeStart.y + dy;
                        break;
                    case 's':
                        newHeight = resizeStart.height + dy;
                        break;
                }

                newWidth = Math.max(20, newWidth);
                newHeight = Math.max(20, newHeight);

                newElements[selectedElement] = {
                    ...element,
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight
                };
            } else if (element.type === 'text') {
                const scale = Math.max(dx, dy) / 100;
                const newSize = Math.max(8, Math.min(200, resizeStart.width + scale * 20));
                newElements[selectedElement] = {
                    ...element,
                    strokeWidth: Math.floor(newSize / 8),
                    fontSize: newSize
                };
            }

            setElements(newElements);
        } else if (tool === 'select' && selectedElement !== null && dragOffset && elements[selectedElement]) {
            const newElements = [...elements];
            newElements[selectedElement] = {
                ...newElements[selectedElement],
                x: pos.x - dragOffset.x,
                y: pos.y - dragOffset.y
            };
            setElements(newElements);
        } else if (tool === 'pen' || tool === 'eraser') {
            setCurrentPath(prev => [...prev, pos]);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.strokeStyle = tool === 'eraser' ? bgColor : color;
                ctx.lineWidth = strokeWidth;
                ctx.moveTo(currentPath[currentPath.length - 1]?.x || pos.x, currentPath[currentPath.length - 1]?.y || pos.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            }
        } else if (cropMode && cropBounds) {
            setCropBounds({
                ...cropBounds,
                width: pos.x - cropBounds.x,
                height: pos.y - cropBounds.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        setStartPos(null);
        setDragOffset(null);
        setResizeHandle(null);
        setResizeStart(null);

        if (tool === 'pen' || tool === 'eraser') {
            if (currentPath.length > 1) {
                const newElement: DrawingElement = {
                    type: 'path',
                    x: 0,
                    y: 0,
                    color: tool === 'eraser' ? bgColor : color,
                    strokeWidth: brushSize || strokeWidth,
                    points: currentPath
                };
                const newElements = [...elements, newElement];
                setElements(newElements);
                addToHistory(newElements);
            }
            setCurrentPath([]);
        } else if (tool !== 'select' && !cropMode) {
            // Handle shape creation if implemented
        } else {
            addToHistory(elements);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (tool !== 'select') return;

        const pos = getMousePos(e);
        const clickedIndex = findElementAtPosition(pos.x, pos.y);

        if (clickedIndex !== null && elements[clickedIndex].type === 'text') {
            setEditingText(clickedIndex);
            setEditingTextValue(elements[clickedIndex].text || '');
        }
    };

    const handleTextEditComplete = () => {
        if (editingText !== null && editingTextValue.trim()) {
            const newElements = elements.map((el, idx) =>
                idx === editingText ? { ...el, text: editingTextValue } : el
            );
            setElements(newElements);
            addToHistory(newElements);
        }
        setEditingText(null);
        setEditingTextValue('');
    };

    const addToHistory = (newElements: DrawingElement[]) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const undo = () => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            setElements(history[historyStep - 1]);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            setHistoryStep(historyStep + 1);
            setElements(history[historyStep + 1]);
        }
    };

    const handleDelete = () => {
        if (selectedElement !== null) {
            const newElements = elements.filter((_, index) => index !== selectedElement);
            setElements(newElements);
            addToHistory(newElements);
            setSelectedElement(null);
        } else {
            // Smart Delete: If nothing selected, clear all (with confirmation if not empty)
            if (elements.length > 0) {
                if (window.confirm('Are you sure you want to clear the entire canvas?')) {
                    setElements([]);
                    addToHistory([]);
                }
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                addToast('Image size must be less than 2MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const scaled = scaleImageToFit(img.width, img.height, width, height);

                    const newElement: DrawingElement = {
                        type: 'image',
                        x: (width - scaled.width) / 2,
                        y: (height - scaled.height) / 2,
                        width: scaled.width,
                        height: scaled.height,
                        imageData: event.target?.result as string,
                        color: '#000000',
                        strokeWidth: 0,
                        isDraggable: true
                    };
                    const newElements = [...elements, newElement];
                    setElements(newElements);
                    addToHistory(newElements);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCrop = () => {
        if (selectedElement !== null && elements[selectedElement].type === 'image') {
            setCropMode(true);
            addToast('Drag to select crop area', 'info');
        } else {
            addToast('Select an image to crop', 'warning');
        }
    };

    const confirmCrop = () => {
        if (selectedElement !== null && cropBounds) {
            const element = elements[selectedElement];
            if (element.type === 'image' && element.imageData) {
                const img = new Image();
                img.src = element.imageData;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    const scaleX = img.width / (element.width || img.width);
                    const scaleY = img.height / (element.height || img.height);

                    const cropX = (cropBounds.x - element.x) * scaleX;
                    const cropY = (cropBounds.y - element.y) * scaleY;
                    const cropW = cropBounds.width * scaleX;
                    const cropH = cropBounds.height * scaleY;

                    canvas.width = cropBounds.width;
                    canvas.height = cropBounds.height;

                    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropBounds.width, cropBounds.height);

                    const croppedData = canvas.toDataURL();

                    const newElements = [...elements];
                    newElements[selectedElement] = {
                        ...element,
                        imageData: croppedData,
                        width: cropBounds.width,
                        height: cropBounds.height,
                        x: cropBounds.x,
                        y: cropBounds.y
                    };

                    setElements(newElements);
                    addToHistory(newElements);
                    setCropMode(false);
                    setCropBounds(null);
                };
            }
        }
    };

    const cancelCrop = () => {
        setCropMode(false);
        setCropBounds(null);
    };

    const handleExportCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && onExport) {
            // Temporarily clear selection for export
            const tempSelection = selectedElement;
            setSelectedElement(null);

            // Wait for state update, then redraw and export
            setTimeout(() => {
                redraw();
                const dataUrl = canvas.toDataURL('image/png');
                onExport(dataUrl);

                // Restore selection
                setSelectedElement(tempSelection);
            }, 10);
        }
    };

    // Expose export function via ref
    useImperativeHandle(ref, () => ({
        triggerExport: () => {
            handleExportCanvas();
        }
    }));

    return (
        <div className="flex flex-col gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setTool('select')}
                        className={`p-2 rounded ${tool === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        title="Select"
                    >
                        <Move size={20} />
                    </button>
                    <button
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded ${tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        title="Pen"
                    >
                        <Paintbrush size={20} />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        title="Eraser"
                    >
                        <Eraser size={20} />
                    </button>
                    <div className="w-px h-8 bg-gray-300 mx-2" />
                    <button
                        onClick={() => {
                            const newElement: DrawingElement = {
                                type: 'text',
                                x: width / 2,
                                y: height / 2,
                                text: 'Double click to edit',
                                color: textColor,
                                strokeWidth: 1,
                                fontSize: fontSize,
                                fontWeight: fontWeight,
                                isDraggable: true
                            };
                            const newElements = [...elements, newElement];
                            setElements(newElements);
                            addToHistory(newElements);
                            setTool('select');
                            setSelectedElement(newElements.length - 1);
                        }}
                        className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        title="Add Text"
                    >
                        <TextIcon size={20} />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        title="Add Image"
                    >
                        <ImageIcon size={20} />
                    </button>
                    <button
                        onClick={handleCrop}
                        className={`p-2 rounded ${cropMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        title="Crop Image"
                    >
                        <Crop size={20} />
                    </button>
                    <div className="w-px h-8 bg-gray-300 mx-2" />
                    <button onClick={undo} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" title="Undo">
                        <Undo size={20} />
                    </button>
                    <button onClick={redo} className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" title="Redo">
                        <Redo size={20} />
                    </button>
                    <button onClick={handleDelete} className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200" title="Delete Selected / Clear All">
                        <Trash2 size={20} />
                    </button>
                </div>

                {cropMode && (
                    <div className="flex gap-2 mb-4">
                        <button onClick={confirmCrop} className="px-3 py-1 bg-green-500 text-white rounded text-sm">
                            Confirm Crop
                        </button>
                        <button onClick={cancelCrop} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                            Cancel
                        </button>
                    </div>
                )}

                <div className="overflow-auto border border-gray-300 rounded bg-gray-50 relative" style={{ padding: padding }}>
                    <canvas
                        ref={canvasRef}
                        width={width}
                        height={height}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => {
                            handleMouseUp();
                            setMousePos(null);
                        }}
                        onDoubleClick={handleDoubleClick}
                        style={{ cursor: cursorStyle }}
                        className="border-2 border-gray-300 rounded-lg shadow-lg"
                    />

                    {/* Brush/Eraser Cursor Preview */}
                    {mousePos && (tool === 'pen' || tool === 'eraser') && !isDrawing && (
                        <div
                            className="pointer-events-none absolute border border-gray-500 rounded-full"
                            style={{
                                left: mousePos.x + padding,
                                top: mousePos.y + padding,
                                width: brushSize,
                                height: brushSize,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: tool === 'eraser' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.1)',
                                borderColor: tool === 'eraser' ? '#000' : color
                            }}
                        />
                    )}

                    {/* Text Editing Overlay */}
                    {editingText !== null && (() => {
                        const element = elements[editingText];
                        if (!element || element.type !== 'text') return null;

                        return (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${element.x + padding}px`,
                                    top: `${element.y + padding - 20}px`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <input
                                    type="text"
                                    value={editingTextValue}
                                    onChange={(e) => setEditingTextValue(e.target.value)}
                                    onBlur={handleTextEditComplete}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleTextEditComplete();
                                        if (e.key === 'Escape') {
                                            setEditingText(null);
                                            setEditingTextValue('');
                                        }
                                    }}
                                    autoFocus
                                    className={`px-3 py-2 rounded border-2 ${isDarkMode ? 'bg-gray-700 border-accent text-white' : 'bg-white border-accent text-gray-900'}`}
                                    style={{
                                        fontSize: `${element.fontSize || fontSize}px`,
                                        fontWeight: element.fontWeight || fontWeight,
                                        minWidth: '200px'
                                    }}
                                />
                            </div>
                        );
                    })()}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleExportCanvas}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <Download size={16} />
                        Export Canvas
                    </button>
                </div>
            </div>
        </div>
    );
});

export default BannerCanvasEditor;

