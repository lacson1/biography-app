# Life Story Biography App - Multi-User Edition

A beautiful, feature-rich biography application that allows multiple users to create, edit, and share their life stories with authentication, user management, and data isolation.

## 🌟 Features

### Multi-User Functionality

- **User Authentication**: Secure email/password login and registration
- **User Management**: Admin panel for managing users, roles, and permissions
- **Data Isolation**: Each user's biography data is completely separate
- **Admin Controls**: Create, edit, delete, and manage user accounts

### Biography Features

- **Multiple Sections**: Overview, Childhood, Family, Career, Achievements, Wisdom
- **Voice Recording**: Record audio memories for each section
- **Photo Upload**: Add photos with captions to any section
- **Timeline Events**: Create chronological life events
- **Special Memories**: Add unique memory entries
- **Book View**: Read your biography as a beautiful book
- **Export Options**: PDF, Word, Web, and Email formats

### Advanced Features

- **Dark Mode**: Toggle between light and dark themes
- **Auto-Save**: Automatic saving of all changes
- **Search**: Find content across your biography
- **Print & Share**: Print your book or share via email
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore database

#### Configure Firebase

1. Get your Firebase config from Project Settings
2. Update `src/firebase.js` with your configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

#### Set Up Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Start the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## 👥 User Management

### Creating Admin Users

1. Register a new user account
2. In Firebase Console, manually set the user's role to "admin" in Firestore
3. Or use the email `admin@example.com` for admin access

### Admin Panel Features

- View all registered users
- Edit user information and roles
- Add new users
- Delete user accounts
- Search and filter users

## 📱 Usage

### For Regular Users

1. **Register/Login**: Create an account or sign in
2. **Write Your Story**: Fill in each section with your memories
3. **Add Media**: Upload photos and record audio
4. **Create Timeline**: Add important life events
5. **Export**: Download your biography in various formats

### For Admins

1. **Access Admin Panel**: Click the "Admin" button in the header
2. **Manage Users**: View, edit, and manage all user accounts
3. **Monitor Activity**: Track user registrations and activity

## 🛠️ Technical Stack

- **Frontend**: React.js with Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Deployment**: Vercel/Netlify ready

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Customization

- **Colors**: Modify Tailwind classes in components
- **Sections**: Add/remove biography sections in `BiographyApp.js`
- **Admin Email**: Change admin email check in the header component

## 📦 Deployment

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload the build folder to Netlify
```

## 🔒 Security Features

- **Authentication**: Secure user login/logout
- **Data Isolation**: Users can only access their own data
- **Role-based Access**: Admin and user permissions
- **Input Validation**: Form validation and sanitization
- **Secure Storage**: Data stored in Firebase with proper rules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the Firebase documentation
- Review the code comments
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social media login (Google, Facebook)
- [ ] Collaborative editing
- [ ] Advanced export formats
- [ ] Mobile app version
- [ ] Offline support
- [ ] Backup and restore features

---

**Happy storytelling! 📖✨**
