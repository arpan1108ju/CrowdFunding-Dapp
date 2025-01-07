export const getThemeClass = (darkClass, lightClass) => {
  return `var(--theme) === 'dark' ? ${darkClass} : ${lightClass}`;
};
