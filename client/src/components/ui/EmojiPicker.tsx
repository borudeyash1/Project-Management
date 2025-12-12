"use client";

import React from "react";
import { EmojiPicker as FrimousseEmojiPicker } from "frimousse";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-full right-0 mb-2 shadow-lg rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
      <FrimousseEmojiPicker.Root
        className="isolate flex h-[368px] w-[352px] flex-col bg-white dark:bg-gray-800"
        onEmojiSelect={({ emoji }) => {
          onEmojiSelect(emoji);
          onClose();
        }}
      >
        <FrimousseEmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-gray-100 dark:bg-gray-700 px-2.5 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent" />
        <FrimousseEmojiPicker.Viewport className="relative flex-1 outline-hidden">
          <FrimousseEmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm dark:text-gray-500">
            Loading emojis…
          </FrimousseEmojiPicker.Loading>
          <FrimousseEmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm dark:text-gray-500">
            No emoji found.
          </FrimousseEmojiPicker.Empty>
          <FrimousseEmojiPicker.List
            className="select-none pb-1.5"
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div
                  className="bg-white dark:bg-gray-800 px-3 pt-3 pb-1.5 font-medium text-gray-600 dark:text-gray-400 text-xs sticky top-0 z-10"
                  {...props}
                >
                  {category.label}
                </div>
              ),
              Row: ({ children, ...props }) => (
                <div className="scroll-my-1.5 px-1.5" {...props}>
                  {children}
                </div>
              ),
              Emoji: ({ emoji, ...props }) => (
                <button
                  className="flex size-8 items-center justify-center rounded-md text-lg hover:bg-gray-100 dark:hover:bg-gray-700 data-[active]:bg-gray-100 dark:data-[active]:bg-gray-700 transition-colors"
                  {...props}
                >
                  {emoji.emoji}
                </button>
              ),
            }}
          />
        </FrimousseEmojiPicker.Viewport>
      </FrimousseEmojiPicker.Root>
    </div>
  );
}
