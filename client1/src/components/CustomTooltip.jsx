const CustomTooltip = ({ children, position = "top", name, hidden }) => {
  const positionClasses = {
    top: "left-1/2 -translate-x-1/2 bottom-full mb-2",
    right: "top-1/2 -translate-y-1/2 left-full ml-2",
    bottom: "left-1/2 -translate-x-1/2 top-full mt-2",
    left: "top-1/2 -translate-y-1/2 right-full mr-2",
  };

  const arrowPositionClasses = {
    top: "left-1/2 -translate-x-1/2 top-full border-t-white",
    right: "top-1/3 -translate-x-1/3 left-[-6px] border-r-white",
    bottom: "left-1/2 -translate-x-1/2 bottom-full border-b-white",
    left: "top-1/3 -translate-x-1/3 right-[-6px] border-l-white",
  };

  return (
    <div className="relative group">
      {/* Target Element */}
      {children}

      {/* Tooltip */}
      <div
        className={`${hidden && "hidden"} absolute z-50 ${positionClasses[position]} px-3 py-1.5 whitespace-nowrap bg-white text-black text-xs font-bold rounded-lg shadow-md opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-focus:opacity-100 group-focus:scale-100`}
      >
        {name}

        {/* Arrow */}
        <div
          className={`absolute w-0 h-0 border-[6px] border-transparent ${arrowPositionClasses[position]}`}
        ></div>
      </div>
    </div>
  );
};

export default CustomTooltip;
