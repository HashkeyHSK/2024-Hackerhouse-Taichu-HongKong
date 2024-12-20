import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const successToast = (msg: string) => {
  toast.success(msg);
};

export const errorToast = (msg: string) => {
  toast.error(msg);
};
