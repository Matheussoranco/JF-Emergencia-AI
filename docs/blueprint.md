# **App Name**: JF Alerta

## Core Features:

- Interactive Crisis Map: Displays an interactive map of Juiz de Fora with toggleable layers for identified Risk Zones (red polygons), Safe Shelter Points (green markers), and Donation Points (blue markers). Clicking on any marker or zone reveals detailed information in a popup.
- AI Situation Report: Presents an AI-generated situation report for Juiz de Fora on a dedicated panel. The generative AI tool, powered by Anthropic Claude, provides summaries of rainfall and flooding, current alert levels (VERDE/AMARELO/LARANJA/VERMELHO), affected areas, and public recommendations, automatically updating every 10 minutes.
- Community Reporting System: Allows users to submit emergency reports detailing issues like flooding, landslides, or blocked roads. Reports include type, description, neighborhood, and severity, appearing as custom markers on the map and in a chronological list. Data is persisted in localStorage.
- Donation Centers Directory: Lists designated donation centers with details such as name, address, accepted items (water, food, clothing, hygiene products), operating hours, and contact information. Includes a 'Get Directions' link for easy navigation and admin capability to add new centers (data stored in localStorage).
- Emergency Contacts Bar: A persistent sticky footer providing quick access to essential emergency contact numbers for Defesa Civil, SAMU, and Bombeiros, along with a WhatsApp link for Defesa Civil, formatted for tap-to-call on mobile devices.

## Style Guidelines:

- Primary color: A clear and vibrant blue (#55C6F7) for interactive elements, highlights, and key information, symbolizing guidance and effective communication.
- Background color: A deep, dark bluish-grey (#0f172a), consistent with an emergency-oriented, dark mode theme and providing high contrast for text and alert indicators.
- Accent color: A bright, energetic cyan (#17E8E8) used for drawing immediate attention to urgent actions or dynamic UI elements.
- Alert colors: A striking red (#F23D3D) for high-risk and emergency alert levels (Vermelho/Laranja); a warm amber (#F2C317) for warnings and caution (Amarelo); and a reassuring green (#4CAF50) to denote safe areas and low alert levels (Verde).
- Font: 'Inter' (sans-serif) for all text elements, chosen for its high readability, modern aesthetic, and clarity crucial for emergency information. The font should be applied consistently across headlines and body text.
- Icons: Use 'Lucide React' for a comprehensive and consistent set of vector icons, maintaining a clear, modern, and easily recognizable visual language for quick comprehension of information.
- Layout: Mobile-first responsive design, adapting to larger screens. The AI status panel will display as a right sidebar on desktop and a bottom sheet on mobile. Key features include a sticky footer for emergency contacts, a top navigation bar for global actions, and a floating action button for reporting. Shadcn/ui components should be utilized for a modular and accessible structure.
- Animation: Implement subtle and smooth animations for map marker interactions. Incorporate loading skeletons while data is being fetched (e.g., for AI reports), and use toast notifications to provide timely feedback on actions like report submissions or AI updates.