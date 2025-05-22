import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';

interface CounterAnimationProps {
  value: number;
  formatter?: (value: number) => string;
  className?: string;
}

const CounterAnimation: React.FC<CounterAnimationProps> = ({ 
  value, 
  formatter = (val) => val.toString(),
  className = ''
}) => {
  const [prevValue, setPrevValue] = useState(value);
  
  // Trigger animation whenever value changes
  useEffect(() => {
    setPrevValue(value);
  }, [value]);
  
  const { number } = useSpring({
    from: { number: prevValue },
    number: value,
    delay: 0,
    config: { mass: 1, tension: 20, friction: 10 }
  });
  
  return (
    <animated.span className={`transition-colors duration-300 ${value > prevValue ? 'text-green-500' : ''} ${className}`}>
      {number.to(n => formatter(Math.floor(n)))}
    </animated.span>
  );
};

export default CounterAnimation;