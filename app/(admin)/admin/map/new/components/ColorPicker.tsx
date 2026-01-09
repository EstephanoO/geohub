"use client";

import React, { useState, useEffect, useRef } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  showGradient?: boolean;
  showPresets?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = "Color",
  showGradient = false,
  showPresets = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  const presetColors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#64748b", "#475569", "#1e293b",
    "#000000", "#ffffff"
  ];

  const gradientPresets = [
    "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    "linear-gradient(135deg, #ec4899, #f59e0b)",
    "linear-gradient(135deg, #10b981, #06b6d4)",
    "linear-gradient(135deg, #8b5cf6, #d946ef)",
    "linear-gradient(135deg, #f97316, #ef4444)",
  ];

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validar y actualizar si es un color válido
    if (isValidColor(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
    setIsOpen(false);
  };

  const isValidColor = (color: string): boolean => {
    // Validación básica para colores hexadecimales y gradientes
    if (color.startsWith('linear-gradient')) return true;
    if (color.startsWith('#') && (color.length === 4 || color.length === 7)) {
      return /^#[0-9A-Fa-f]+$/.test(color);
    }
    if (color.startsWith('rgb') || color.startsWith('hsl')) {
      try {
        new Option().style.color = color;
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const getContrastColor = (hexColor: string): string => {
    // Calcular color de contraste para texto
    if (!hexColor.startsWith('#')) return '#000000';
    
    const color = hexColor.slice(1);
    const rgb = parseInt(color, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="relative" ref={pickerRef}>
      <label 
        htmlFor={`color-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={`Abrir selector de color para ${label}`}
        >
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: isValidColor(inputValue) ? inputValue : '#ffffff' }}
          />
          <span className="text-gray-700">{inputValue}</span>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          id={`color-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          aria-label={`Valor del color ${label}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 p-3 bg-white border border-gray-300 rounded-md shadow-lg">
          {showPresets && !showGradient && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Colores Preset</p>
              <div className="grid grid-cols-6 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={`preset-${color}`}
                    type="button"
                    onClick={() => handlePresetClick(color)}
                    className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    aria-label={`Seleccionar color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {showGradient && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Gradientes</p>
              <div className="space-y-1">
                {gradientPresets.map((gradient) => (
                  <button
                    key={`gradient-${gradient.replace(/[^a-zA-Z0-9]/g, '')}`}
                    type="button"
                    onClick={() => handlePresetClick(gradient)}
                    className="w-full h-8 rounded border border-gray-300 hover:scale-105 transition-transform"
                    style={{ background: gradient }}
                    aria-label={`Seleccionar gradiente`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Personalizado</p>
          <input
            type="color"
            value={isValidColor(inputValue) && inputValue.startsWith('#') ? inputValue : '#000000'}
            onChange={(e) => {
              const color = e.target.value;
              setInputValue(color);
              onChange(color);
            }}
            className="w-full h-10 rounded cursor-pointer"
            aria-label="Selector de color personalizado"
          />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;