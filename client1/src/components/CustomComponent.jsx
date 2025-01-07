import { useTheme } from '../context/ThemeContext';

const CustomComponent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Component content */}
    </div>
  );
}; 