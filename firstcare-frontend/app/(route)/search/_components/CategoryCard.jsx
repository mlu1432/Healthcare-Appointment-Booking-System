// app/(route)/search/_components/CategoryCard.jsx
// Default to empty string if no icon is provided
// Default to "Category" if no title is provided
// Default to a no-op function if onClick is not provided
import React from "react";
import Image from "next/image";
import PropTypes from "prop-types";

export default function CategoryCard({
  icon = "",
  title = "Category",
  onClick = () => { },
}) {
  return (
    <div
      className="p-4 border border-[#E8DBDB] rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-300 ease-in-out"
      onClick={onClick}
    >
      {/* Icon Image */}
      <Image src={icon} alt={`${title} Icon`} width={128} height={128} />

      {/* Category Title */}
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
    </div>
  );
}

// Props Validation
CategoryCard.propTypes = {
  icon: PropTypes.string.isRequired, // Path to the icon image
  title: PropTypes.string.isRequired, // Title of the category
  onClick: PropTypes.func, // Function for handling clicks (optional)
};
