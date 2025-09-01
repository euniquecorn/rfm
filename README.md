# RFM - Angular + Node.js + Fabric.js Canvas Editor

A powerful canvas editor built with Angular 20, Node.js, Express, and Fabric.js. This application provides an interactive canvas interface for creating, editing, and managing graphical content with a full-stack architecture.

## 🚀 Features

### Frontend (Angular 20)
- **Interactive Canvas**: Built with Fabric.js for rich canvas interactions
- **Shape Creation**: Add rectangles, circles, and text elements
- **Object Manipulation**: Move, resize, and delete canvas objects
- **Export Functionality**: Download canvas as PNG images
- **Responsive Design**: Mobile-friendly interface
- **Server-Side Rendering (SSR)**: Optimized for performance and SEO
- **Modern Angular**: Uses standalone components and signals

### Backend (Node.js + Express)
- **RESTful API**: Well-structured API endpoints
- **Canvas Management**: Save and retrieve canvas data
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error management
- **TypeScript**: Fully typed backend implementation

## 🛠️ Tech Stack

- **Frontend**: Angular 20, TypeScript, Fabric.js, RxJS
- **Backend**: Node.js, Express.js, TypeScript
- **Build Tools**: Angular CLI, Webpack
- **Styling**: CSS3, Flexbox, CSS Grid
- **Development**: Hot reload, Source maps

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone https://github.com/[your-username]/rfm.git
cd rfm
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Start the server:
```bash
npm run serve:ssr:my-angular-app
```

The application will be available at `http://localhost:4000`

## 🚀 Development

### Development Server
```bash
npm run start:dev
```
Runs the Angular development server on `http://localhost:4200`

### Build for Production
```bash
npm run build:prod
```

### Run Tests
```bash
npm test
```

## 📚 API Endpoints

### Health Check
- **GET** `/api/health` - Server health status

### Canvas Operations
- **POST** `/api/canvas/save` - Save canvas data
- **GET** `/api/canvas/list` - Get list of saved canvases
- **GET** `/api/canvas/:id` - Get specific canvas data

## 🎨 Canvas Features

### Available Tools
- **Add Rectangle**: Create rectangular shapes
- **Add Circle**: Create circular shapes  
- **Add Text**: Add text elements
- **Delete Selected**: Remove selected objects
- **Clear Canvas**: Clear entire canvas
- **Save Canvas**: Save to backend
- **Export PNG**: Download as image

### Canvas Interactions
- **Click & Drag**: Move objects around
- **Corner Handles**: Resize objects
- **Selection**: Click to select objects
- **Multi-selection**: Select multiple objects

## 🏗️ Project Structure

```
src/
├── app/
│   ├── canvas/              # Canvas component
│   │   ├── canvas.ts        # Component logic
│   │   ├── canvas.html      # Template
│   │   └── canvas.css       # Styles
│   ├── services/            # Angular services
│   │   └── api.ts          # API service
│   ├── app.ts              # Root component
│   └── app.config.ts       # App configuration
├── server.ts               # Express server
└── main.ts                 # Angular bootstrap
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 4000)

### Angular Configuration
- SSR enabled by default
- HttpClient with fetch API
- Standalone components architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Angular](https://angular.io/) - The web framework
- [Fabric.js](http://fabricjs.com/) - Canvas library
- [Express.js](https://expressjs.com/) - Backend framework
- [Node.js](https://nodejs.org/) - Runtime environment

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Built with ❤️ using Angular, Node.js, and Fabric.js**
