const CustomTooltip = ({ children, position = "top", name, hidden }) => {
    const positionClasses = {
      top: "left-1/2 -translate-x-1/2 bottom-full mb-2",
      right: "top-1/2 -translate-y-1/2 left-full ml-2",
      bottom: "left-1/2 -translate-x-1/2 top-full mt-2",
      left: "top-1/2 -translate-y-1/2 right-full mr-2",
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
        </div>
      </div>
    );
  };
  
  export default CustomTooltip;
  