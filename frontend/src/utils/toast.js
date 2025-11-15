import { toast } from "react-toastify";

// Centralized toast helpers to keep UI consistent and avoid duplicates
const base = {
    position: "top-right",
    autoClose: 2800,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

// Use message as toastId to avoid stacking identical messages
const idFor = (msg) => (typeof msg === "string" ? msg : undefined);

export const notify = {
    success: (message, opts = {}) =>
        toast.success(message, { ...base, toastId: idFor(message), ...opts }),
    error: (message, opts = {}) =>
        toast.error(message, { ...base, toastId: idFor(message), ...opts }),
    info: (message, opts = {}) =>
        toast.info(message, { ...base, toastId: idFor(message), ...opts }),
    warn: (message, opts = {}) =>
        toast.warn(message, { ...base, toastId: idFor(message), ...opts }),
};

export default notify;
