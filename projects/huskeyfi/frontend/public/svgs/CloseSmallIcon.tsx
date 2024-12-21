const CloseSmallIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.68421 12L0 10.3158L4.33083 5.98496L0 1.68421L1.68421 0L6.01504 4.33083L10.3158 0L12 1.68421L7.66917 5.98496L12 10.3158L10.3158 12L6.01504 7.66917L1.68421 12Z"
        fill="#D6ECFF"
      />
    </svg>
  );
};

export default CloseSmallIcon;
