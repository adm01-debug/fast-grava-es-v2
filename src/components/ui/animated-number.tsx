import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  className,
  formatOptions,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formattedValue = new Intl.NumberFormat("pt-BR", formatOptions).format(
    Math.round(displayValue)
  );

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

// ===== ANIMATED COUNTER WITH SPRING =====
interface SpringCounterProps {
  value: number;
  className?: string;
  decimals?: number;
}

export function SpringCounter({ value, className, decimals = 0 }: SpringCounterProps) {
  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) =>
    current.toFixed(decimals)
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={cn("tabular-nums", className)}>
      {display}
    </motion.span>
  );
}

// ===== ANIMATED PERCENTAGE =====
interface AnimatedPercentageProps {
  value: number;
  className?: string;
  showSign?: boolean;
  colorize?: boolean;
}

export function AnimatedPercentage({
  value,
  className,
  showSign = true,
  colorize = true,
}: AnimatedPercentageProps) {
  const colorClass = colorize
    ? value > 0
      ? "text-success"
      : value < 0
      ? "text-destructive"
      : "text-muted-foreground"
    : "";

  const sign = showSign && value > 0 ? "+" : "";

  return (
    <span className={cn("tabular-nums font-medium", colorClass, className)}>
      <AnimatedNumber value={value} prefix={sign} suffix="%" />
    </span>
  );
}

// ===== ANIMATED CURRENCY =====
interface AnimatedCurrencyProps {
  value: number;
  currency?: string;
  className?: string;
}

export function AnimatedCurrency({
  value,
  currency = "BRL",
  className,
}: AnimatedCurrencyProps) {
  return (
    <AnimatedNumber
      value={value}
      className={className}
      formatOptions={{
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }}
    />
  );
}

// ===== FLIP NUMBER ANIMATION =====
interface FlipNumberProps {
  value: number;
  className?: string;
}

export function FlipNumber({ value, className }: FlipNumberProps) {
  const digits = String(value).split("");

  return (
    <div className={cn("flex", className)}>
      {digits.map((digit, index) => (
        <motion.span
          key={`${index}-${digit}`}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: index * 0.05,
          }}
          className="inline-block tabular-nums"
          style={{ transformOrigin: "center bottom" }}
        >
          {digit}
        </motion.span>
      ))}
    </div>
  );
}
