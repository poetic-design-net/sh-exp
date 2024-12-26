import { SVGProps } from "react";

interface TelegramProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function Telegram({
  size = 24,
  className = "",
  ...props
}: TelegramProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701l-.321 4.843c.47 0 .677-.216.94-.477l2.26-2.196l4.696 3.466c.866.48 1.488.233 1.704-.803l3.082-14.503c.314-1.262-.485-1.833-1.539-1.297z" />
    </svg>
  );
}
