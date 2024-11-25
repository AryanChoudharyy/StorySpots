// setup.js
const fs = require('fs');
const path = require('path');

const structure = {
  'src': {
    'app': {
      'api': {
        'auth': {
          'callback': {
            'route.ts': '',
          },
          'route.ts': '',
        },
        'stories': {
          'route.ts': '',
        },
      },
      'dashboard': {
        'page.tsx': '',
        'loading.tsx': '',
      },
      'profile': {
        'page.tsx': '',
      },
      'layout.tsx': '',
      'page.tsx': '',
      'globals.css': '',
    },
    'components': {
      'auth': {
        'AuthButton.tsx': '',
        'AuthForm.tsx': '',
      },
      'layout': {
        'Navbar.tsx': '',
        'Footer.tsx': '',
      },
      'map': {
        'Map.tsx': '',
        'Marker.tsx': '',
        'MapControls.tsx': '',
      },
      'stories': {
        'StoryCard.tsx': '',
        'StoryForm.tsx': '',
        'StoryList.tsx': '',
        'StoryModal.tsx': '',
      },
      'ui': {
        'Button.tsx': '',
        'Input.tsx': '',
        'Modal.tsx': '',
        'Toast.tsx': '',
      },
    },
    'lib': {
      'supabase': {
        'client.ts': '',
        'server.ts': '',
      },
      'types': {
        'index.ts': '',
      },
      'utils': {
        'constants.ts': '',
        'helpers.ts': '',
      },
    },
    'middleware.ts': '',
  },
  'public': {
    'images': {},
  },
};

function createDirectoryStructure(basePath, structure) {
  Object.entries(structure).forEach(([name, content]) => {
    const currentPath = path.join(basePath, name);
    
    if (typeof content === 'object') {
      fs.mkdirSync(currentPath, { recursive: true });
      createDirectoryStructure(currentPath, content);
    } else {
      fs.writeFileSync(currentPath, '');
    }
  });
}

createDirectoryStructure('.', structure);
console.log('Project structure created successfully!');