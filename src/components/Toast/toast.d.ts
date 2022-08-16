export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export type ToastType = "success" | "info" | "warning" | "error";
export type IconSize = "sm" | "md" | undefined;

export interface ToastProperties {
  id: number | string;
  type: ToastType;
  title: string;
  body: string;
  iconSize?: IconSize;
  comp?: React.ReactElement;
}
