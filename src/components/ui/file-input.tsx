
import * as React from "react"
import { cn } from "@/lib/utils"

interface FileInputProps extends React.ComponentPropsWithoutRef<"input"> {
  containerClassName?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, containerClassName, accept, ...props }, ref) => {
    // Create a reference to the hidden file input
    const inputRef = React.useRef<HTMLInputElement>(null);
    const displayRef = React.useRef<HTMLDivElement>(null);

    const handleButtonClick = () => {
      inputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (props.onChange) {
        props.onChange(event);
      }

      // Update the display element with the selected file name
      if (displayRef.current && event.target.files && event.target.files.length > 0) {
        displayRef.current.textContent = event.target.files[0].name;
      } else if (displayRef.current) {
        displayRef.current.textContent = "No file chosen";
      }
    };

    return (
      <div className={cn("flex flex-col space-y-2", containerClassName)}>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleButtonClick}
            className="bg-tigerBlack text-white px-3 py-2 rounded cursor-pointer hover:bg-tigerBlack/90 transition-colors"
          >
            Choose File
          </button>
          <div ref={displayRef} className="text-sm text-gray-500">
            No file chosen
          </div>
        </div>
        <input
          type="file"
          ref={(node) => {
            // Handle both the passed ref and the local ref
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            inputRef.current = node;
          }}
          className="hidden"
          accept={accept}
          {...props}
          onChange={handleFileChange}
        />
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
