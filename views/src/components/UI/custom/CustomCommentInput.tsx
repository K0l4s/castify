// src/components/UI/custom/CustomCommentInput.tsx
import React, { useRef, useState, useEffect } from "react";
import CustomButton from "./CustomButton";
import Tooltip from "./Tooltip";
import { IoSend } from "react-icons/io5";
import { RxReset } from "react-icons/rx";
import "./styles/commentInput.css";
import { BiReply } from "react-icons/bi";

interface CustomCommentInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  initialContent?: string;
  maxLength?: number;
  className?: string;
  mentionedUser?: string | null;
  onRemoveMention?: () => void;
  autoFocus?: boolean;
}

const CustomCommentInput: React.FC<CustomCommentInputProps> = ({
  onSubmit,
  placeholder = "Add a comment...",
  initialContent = "",
  maxLength = 2000,
  className = "",
  mentionedUser = null,
  onRemoveMention,
  autoFocus = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // Focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.innerHTML = initialContent;
      
      // Focus and position cursor at the end if autoFocus is true
      if (autoFocus) {
        inputRef.current.focus();
        
        // Set cursor position to end of content
        const range = document.createRange();
        const selection = window.getSelection();
        
        // Make sure there's content to focus at the end of
        if (inputRef.current.childNodes.length > 0) {
          const lastNode = inputRef.current.childNodes[inputRef.current.childNodes.length - 1];
          if (lastNode.nodeType === Node.TEXT_NODE) {
            // If it's a text node, place cursor at the end of the text
            range.setStart(lastNode, lastNode.textContent?.length || 0);
          } else {
            // If it's an element node, place cursor after it
            range.setStartAfter(lastNode);
          }
        } else {
          // If there's no content, just focus inside the element
          range.setStart(inputRef.current, 0);
        }
        
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [initialContent, autoFocus]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    let html = e.currentTarget.innerHTML;
    const contentText = e.currentTarget.innerText || "";
    
    // Check if content is only a <br> tag or empty and reset it
    if (html === '<br>' || html === '') {
      html = '';
      if (inputRef.current) {
        inputRef.current.innerHTML = '';
      }
    }
    
    if (contentText.length <= maxLength) {
      setContent(html);
      setError(null);
    } else {
      setError(`Comment cannot exceed ${maxLength} characters`);
      setContent(html);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Submit on Ctrl+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    
    // Handle backspace on empty content to remove mention
    if (
      e.key === "Backspace" && 
      mentionedUser && 
      inputRef.current?.innerText === ""
    ) {
      e.preventDefault();
      onRemoveMention?.();
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      setError("Please add your thoughts");
      return;
    };
    
    const textLength = inputRef.current?.innerText.length || 0;
    if (textLength > maxLength) {
      setError(`Comment cannot exceed ${maxLength} characters`);
      return;
    }
    
    onSubmit(content);
    resetInput();
  };

  const resetInput = () => {
    setContent("");
    setError(null);
    if (inputRef.current) {
      inputRef.current.innerHTML = ""; // Clear the content of the div
    }
  };

  const handleRemoveMentionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling
    
    if (onRemoveMention) {
      onRemoveMention();
    }
    
    // Focus the input after removing the mention
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Calculate text length for character counter
  const calculateTextLength = () => {
    if (!inputRef.current) return 0;
    
    const html = inputRef.current.innerHTML;
    if (html === '' || html === '<br>') return 0;
    
    return inputRef.current.innerText.length;
  };
  
  const textLength = calculateTextLength();

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Mentioned user tag if provided */}
      {mentionedUser && (
        <div className="flex flex-wrap">
          <div className="inline-flex items-center bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm mr-2 mb-2">
            <BiReply className="mr-1" />
            <span>@{mentionedUser}</span>
            <button
              onClick={handleRemoveMentionClick} // Use the explicit handler
              className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
              aria-label="Remove mention"
              type="button" // Ensure it's a button type
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div
        ref={inputRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`comment-input flex-1 p-2 w-full border rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white resize-none h-auto min-h-[43px] overflow-auto ${
          error ? "border-red-500" : ""
        } ${className}`}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        data-placeholder={placeholder}
      />
      
      <div className="flex justify-between w-full">
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          {textLength} / {maxLength}
        </div>
      </div>
      
      <div className="flex gap-3 justify-end">
        <Tooltip text="Reset">
          <CustomButton
            icon={<RxReset size={20} />}
            onClick={resetInput}
            variant="ghost"
            className="py-3 dark:hover:bg-gray-900"
          />
        </Tooltip>
        
        <Tooltip text="Send">
          <CustomButton
            icon={<IoSend size={20} />}
            onClick={handleSubmit}
            variant="primary"
            className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500 py-3"
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default CustomCommentInput;