-- ============================================
-- SEED: Productos Globales (Screen PRO)
-- Versión Corregida y Estandarizada
-- ============================================

INSERT INTO products (code, name, category, price_type, base_price, unit_label, owner_id) VALUES
-- PUERTAS (Modelos G, M, MG, MA)
('G001', 'Puerta Full Glass (Vidrio)', 'puerta', 'por_unidad', 850.00, 'u', NULL),
('G002', 'Puerta Vidrio 3 Paneles Verticales', 'puerta', 'por_unidad', 925.00, 'u', NULL),
('G003', 'Puerta Vidrio con División Horizontal Central', 'puerta', 'por_unidad', 875.00, 'u', NULL),
('G004', 'Puerta Vidrio 3 Divisiones Horizontales', 'puerta', 'por_unidad', 900.00, 'u', NULL),
('G005', 'Puerta Vidrio 4 Divisiones Horizontales', 'puerta', 'por_unidad', 950.00, 'u', NULL),
('G011', 'Puerta Vidrio Diseño Asimétrico Mod. 11', 'puerta', 'por_unidad', 1100.00, 'u', NULL),
('G012', 'Puerta Vidrio Diseño Mod. 12', 'puerta', 'por_unidad', 1100.00, 'u', NULL),
('M001', 'Puerta Sólida de Aluminio (Regular)', 'puerta', 'por_unidad', 650.00, 'u', NULL),
('M020', 'Puerta Sólida con 2 Líneas Horizontales', 'puerta', 'por_unidad', 725.00, 'u', NULL),
('MG001', 'Puerta Media Vida (Vidrio Arriba)', 'puerta', 'por_unidad', 775.00, 'u', NULL),
('MA001', 'Puerta de Aluminio con Lamas (Ventilación)', 'puerta', 'por_unidad', 680.00, 'u', NULL),
('PI001', 'Puerta Interior de Habitación', 'puerta', 'por_unidad', 180.00, 'u', NULL),

-- VENTANAS (Estandarizado V00x)
('V001', 'Ventana de Seguridad Lama Aluminio Sólida', 'ventana', 'por_pie_cuadrado', 28.00, 'p2', NULL),
('V002', 'Ventana de Seguridad Lama Cristal (Acid/Blue)', 'ventana', 'por_pie_cuadrado', 32.00, 'p2', NULL),
('V003', 'Ventana Casement de Seguridad', 'ventana', 'por_pie_cuadrado', 45.00, 'p2', NULL),
('V004', 'Ventana Fija de Seguridad', 'ventana', 'por_pie_cuadrado', 25.00, 'p2', NULL),
('V005', 'Ventana Transon de Arco (Especial)', 'ventana', 'por_unidad', 450.00, 'u', NULL),

-- SCREENS (Estandarizado SC00x)
('SC001', 'Puerta Screen Regular', 'screen', 'por_unidad', 150.00, 'u', NULL),
('SC002', 'Puerta Screen Heavy Duty', 'screen', 'por_unidad', 225.00, 'u', NULL),
('SC003', 'Puerta Screen de Seguridad (Malla Inox)', 'screen', 'por_unidad', 650.00, 'u', NULL),
('SC004', 'Screen para Ventana (Fibra de Vidrio)', 'screen', 'por_pie_cuadrado', 3.50, 'p2', NULL),
('SC005', 'Screen para Ventana (Aluminio)', 'screen', 'por_pie_cuadrado', 5.00, 'p2', NULL),

-- CLOSETS
('CL001', 'Puerta de Closet Corrediza (Espejo/Alum)', 'closet', 'por_unidad', 450.00, 'u', NULL),

-- SCREEN A/C (Nueva Categoría)
('AC001', 'Screen A/C Unidad Pequeña (hasta 12,000 BTU)', 'screen_ac', 'por_unidad', 85.00, 'u', NULL),
('AC002', 'Screen A/C Unidad Mediana (hasta 18,000 BTU)', 'screen_ac', 'por_unidad', 110.00, 'u', NULL),
('AC003', 'Screen A/C Unidad Grande (hasta 24,000 BTU)', 'screen_ac', 'por_unidad', 135.00, 'u', NULL),
('AC004', 'Screen A/C Medida Especial', 'screen_ac', 'por_pie_cuadrado', 12.00, 'p2', NULL),

-- PUERTAS DE GARAJE (Nueva Categoría)
('GD001', 'Puerta de Garaje Seccional 8x7 Blanca', 'garaje', 'por_unidad', 1200.00, 'u', NULL),
('GD002', 'Puerta de Garaje Seccional 9x7 Blanca', 'garaje', 'por_unidad', 1350.00, 'u', NULL),
('GD003', 'Puerta de Garaje Seccional 16x7 Doble', 'garaje', 'por_unidad', 2100.00, 'u', NULL),
('GD004', 'Puerta de Garaje con Ventanas', 'garaje', 'por_unidad', 1500.00, 'u', NULL),
('GD005', 'Instalación Puerta de Garaje', 'garaje', 'por_unidad', 250.00, 'u', NULL),

-- SERVICIOS (Estandarizado SV00x)
('SV001', 'Instalación de Puerta', 'miscelanea', 'por_unidad', 125.00, 'u', NULL),
('SV002', 'Instalación de Ventana', 'miscelanea', 'por_unidad', 45.00, 'u', NULL),
('SV003', 'Remoción de Unidad Vieja', 'miscelanea', 'por_unidad', 35.00, 'u', NULL);
