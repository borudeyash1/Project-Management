import React, { useEffect, useRef } from 'react';
import './ContextMenu.css';

interface ContextMenuAction {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    divider?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    actions: ContextMenuAction[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, actions, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose]);

    // Adjust position to keep within viewport
    const style: React.CSSProperties = {
        top: y,
        left: x,
    };

    // Simple viewport check (can be improved)
    if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        if (y + rect.height > window.innerHeight) {
            style.top = y - rect.height;
        }
        if (x + rect.width > window.innerWidth) {
            style.left = x - rect.width;
        }
    }

    return (
        <div className="context-menu" style={style} ref={menuRef}>
            {actions.map((action, index) => (
                <React.Fragment key={index}>
                    {action.divider ? (
                        <div className="context-menu-divider" />
                    ) : (
                        <div
                            className={`context-menu-item ${action.danger ? 'danger' : ''}`}
                            onClick={() => {
                                action.onClick();
                                onClose();
                            }}
                        >
                            <span className="context-menu-icon">{action.icon}</span>
                            <span className="context-menu-label">{action.label}</span>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default ContextMenu;
