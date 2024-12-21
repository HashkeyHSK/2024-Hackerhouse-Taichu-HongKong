// Import toast notification library and styles
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Display a success toast notification with the given message
export const successToast = (msg: string) => {
  toast.success(msg);
};

// Display an error toast notification with the given message
export const errorToast = (msg: string) => {
  toast.error(msg);
};
