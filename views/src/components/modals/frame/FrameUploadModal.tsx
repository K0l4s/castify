import React, { useState } from "react";
import CustomModal from "../../UI/custom/CustomModal";
import { RiUploadCloudLine } from "react-icons/ri";
import { useToast } from "../../../context/ToastProvider";
import { uploadFrame } from "../../../services/FrameService";
import { validateFileType } from "../../../utils/FileValidation";
import CustomButton from "../../UI/custom/CustomButton";
import coinIcon from "../../../assets/images/coin.png";
import Avatar from "../../UI/user/Avatar";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface FrameUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FrameUploadModal: React.FC<FrameUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFilename, setImageFilename] = useState<string | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const toast = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];

      if (!validateFileType(file, validExtensions)) {
        toast.error(
          "Invalid file type. Please select a .jpg, .jpeg, .png, or .webp file."
        );
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImageFile(file);
      setImageFilename(file.name);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setName(value);
      setNameError(value.length === 0 ? "Name is required" : "");
    } else {
      setNameError("Name cannot exceed 100 characters");
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^0+/, ''); // Remove leading zeros
    const numValue = parseInt(value || '0');

    if (numValue >= 0) {
      setPrice(numValue);
      setPriceError(numValue === 0 ? "Price must be greater than 0" : "");
    } else {
      setPriceError("Price cannot be negative");
    }
  };

  const handleUpload = async () => {
    if (!name || !imageFile || price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const loadingToastId = toast.loading("Uploading frame, please wait...");
    onClose();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price.toString());
      formData.append("image", imageFile);

      await uploadFrame(formData);
      toast.success("Frame uploaded successfully!");
      onSuccess?.();
      toast.closeLoadingToast(loadingToastId);
      clearData();
    } catch (error) {
      console.error("Failed to upload frame:", error);
      toast.error("Failed to upload frame. Please try again.");
      toast.closeLoadingToast(loadingToastId);
    }
  };

  const clearData = () => {
    setName("");
    setPrice(0);
    setNameError("");
    setPriceError("");
    setImageFile(null);
    setImagePreview(null);
    setImageFilename(null);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      animation="zoom"
      size="xl"
      title="Upload New Frame"
      closeOnOutsideClick={false}
      closeOnEsc={false}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          {/* Name */}
          <label
            className={`mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 ${nameError ? "text-red-600 dark:text-red-600" : ""
              }`}
          >
            Name (required)
          </label>
          <input
            type="text"
            placeholder="Enter frame name"
            value={name}
            onChange={handleNameChange}
            className={`mb-1 w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-800 ${nameError ? "border-red-500" : ""
              }`}
          />
          {nameError && <div className="text-sm text-red-500">{nameError}</div>}

          {/* Price */}
          <label
            className={`mt-4 mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 ${priceError ? "text-red-600 dark:text-red-600" : ""
              }`}
          >
            Price (required)
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="Enter frame price"
              value={price || ''}
              onChange={handlePriceChange}
              className={`mb-1 w-full p-2 pr-10 border border-gray-300 rounded bg-white dark:bg-gray-800 ${priceError ? "border-red-500" : ""
                }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <img src={coinIcon} alt="coin" className="w-5 h-5" />
            </div>
          </div>
          {priceError && <div className="text-sm text-red-500">{priceError}</div>}
        </div>

        <div className="flex flex-col">
          {imagePreview && (
            <div className="mb-4">
              {/* <img src={imagePreview} alt="Frame Preview" className="w-full rounded" /> */}
              <div className="relative aspect-square w-10/12 m-auto p-5">
                <Avatar
                  usedFrame={{
                    id: "123",
                    imageURL: imagePreview,
                    name: name || "New Frame",
                    price: price || 0,
                  }}
                  avatarUrl={currentUser?.avatarUrl}
                  alt={imageFilename || "Frame Preview"}
                  width="w-full"
                  height="h-full"
                />
              </div>
            </div>
          )}
          {imagePreview && (
            <>
              <span className="text-gray-400">Filename</span>
              <span
                className="text-sm text-black dark:text-white whitespace-nowrap overflow-hidden"
                title={`${imageFilename}`}
              >
                {imageFilename}
              </span>
            </>
          )}
          <CustomButton
            icon={<RiUploadCloudLine size={24} />}
            text="Choose Image"
            variant="primary"
            onClick={() => document.getElementById("image-input")?.click()}
            className="mt-2 uppercase leading-normal font-medium"
          />
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <CustomButton
          text="Cancel"
          variant="outline"
          onClick={onClose}
        />
        <CustomButton
          text="Upload"
          variant="primary"
          onClick={handleUpload}
        />
      </div>
    </CustomModal>
  );
};

export default FrameUploadModal; 