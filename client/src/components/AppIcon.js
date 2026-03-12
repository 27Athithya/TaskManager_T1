import React from 'react';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import { colors } from '../theme/theme';

const iconMap = {
  plus: (color) => (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  edit: (color) => (
    <>
      <Path d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.1l-1.9-1.9a1.5 1.5 0 0 0-2.1 0L4 16v4z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M12.8 6.2l5 5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  trash: (color) => (
    <>
      <Path d="M4 7h16" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
      <Path d="M7 7l1 12h8l1-12" fill="none" stroke={color} strokeWidth="2.1" strokeLinejoin="round" />
      <Path d="M9 7V5h6v2" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
      <Path d="M10 11v5M14 11v5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  calendar: (color) => (
    <>
      <Rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke={color} strokeWidth="2" />
      <Path d="M7 3.5V7M17 3.5V7M3.5 9.5h17" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  clock: (color) => (
    <>
      <Circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth="2" />
      <Path d="M12 8v4.5l3 2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  bell: (color) => (
    <>
      <Path d="M18 16H6c1.1-1 2-2.5 2-4.2V10a4 4 0 1 1 8 0v1.8c0 1.7.9 3.2 2 4.2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M10 18a2 2 0 0 0 4 0" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  check: (color) => (
    <>
      <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
      <Polyline points="8,12.4 11,15.2 16,9.8" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  history: (color) => (
    <>
      <Path d="M4 12a8 8 0 1 0 2.3-5.7" fill="none" stroke={color} strokeWidth="2" />
      <Path d="M4 4v4h4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 8v4l2.6 1.8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  report: (color) => (
    <>
      <Rect x="5" y="3.5" width="14" height="17" rx="2.5" fill="none" stroke={color} strokeWidth="2" />
      <Path d="M9 10h6M9 14h6M9 18h3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  share: (color) => (
    <>
      <Path d="M12 15V4" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Path d="M8.5 7.5L12 4l3.5 3.5" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="5" y="13" width="14" height="7" rx="2.5" fill="none" stroke={color} strokeWidth="2" />
    </>
  ),
};

const AppIcon = ({ name, size = 22, color = colors.icon }) => {
  const iconFactory = iconMap[name];
  const icon = iconFactory ? iconFactory(color) : null;
  if (!icon) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icon}
    </Svg>
  );
};

export default AppIcon;
