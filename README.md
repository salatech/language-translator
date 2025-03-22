# Language Translator App

A modern, responsive web application that provides real-time translation across multiple languages, powered by the MyMemory Translation API.

![Language Translator App Screenshot](https://asset.cloudinary.com/dvd8hlffl/c79ade9f0ae352a5b105eb03c2b2c402)

## Features

- **Real-time Translation**: Translate text between numerous languages with automatic translation as you type
- **Text-to-Speech**: Listen to both original text and translations with built-in speech synthesis
- **Copy to Clipboard**: Easily copy texts with visual confirmation
- **Language Exchange**: Quickly swap between source and target languages
- **Recent Translations**: Access your translation history for quick reuse
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

## Technologies Used

- **Next.js**: React framework for building the application
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling and responsive design
- **Lucide React**: For modern, customizable icons
- **MyMemory Translation API**: For powering the translation functionality
- **Web Speech API**: For text-to-speech capabilities

## Getting Started

### Prerequisites

- Node.js (version 14.x or later)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/language-translator-app.git
   cd language-translator-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Translation**:
   - Enter text in the left text area
   - Select source and target languages from the dropdown menus
   - View the translation in the right text area

2. **Additional Features**:
   - Click the speaker icon to hear the text spoken
   - Click the copy icon to copy text to clipboard
   - Use the exchange button to swap languages
   - Click on any recent translation to load it into the input field

## Project Structure

```
language-translator-app/
├── app/
│   └── page.tsx        # Main application component
├── components/
│   └── countries.ts    # List of available languages
├── public/
│   └── ...             # Static assets
└── ...                 # Configuration files
```

## Customization

### Adding More Languages

Edit the `components/countries.ts` file to add or remove language options:

```typescript
const countries = {
  "en-GB": "English",
  "fr-FR": "French",
  // Add more languages here
};

export default countries;
```

### Styling

The application uses Tailwind CSS for styling. You can customize the appearance by modifying the class names in the components or by updating your Tailwind configuration.

## API Usage

This application uses the MyMemory Translation API. The free tier has certain limitations:

- 5,000 characters per day for anonymous usage
- No API key required for basic usage
- For higher volumes, consider registering for a MyMemory API key

## Browser Compatibility

The application works best in modern browsers that support:

- Web Speech API for text-to-speech functionality
- Clipboard API for copy functionality
- CSS Grid and Flexbox for layout

## License

[MIT License](LICENSE)

## Acknowledgements

- [MyMemory Translation API](https://mymemory.translated.net/doc/spec.php) for providing the translation service
- [Lucide Icons](https://lucide.dev/) for the beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request