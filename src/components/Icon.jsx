import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcons from "@fortawesome/free-solid-svg-icons";

/**
 * A lightweight wrapper for FontAwesome icons.
 * Usage: <Icon name="faUser" />
 */
export function Icon({ name, className, ...props }) {
  const icon = SolidIcons[name];
  if (!icon) return null;
  return <FontAwesomeIcon icon={icon} className={className} {...props} />;
}

export default Icon;
