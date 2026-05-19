const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, '..', 'node_modules', 'react-native-razorpay', 'android', 'build.gradle');

if (fs.existsSync(gradlePath)) {
  let content = fs.readFileSync(gradlePath, 'utf8');
  
  // Add namespace if missing
  if (!content.includes('namespace "com.razorpay.rn"')) {
    content = content.replace(
      /android\s*\{/,
      'android {\n    namespace "com.razorpay.rn"'
    );
    fs.writeFileSync(gradlePath, content, 'utf8');
    console.log('Successfully patched react-native-razorpay android/build.gradle with namespace');
  } else {
    console.log('react-native-razorpay android/build.gradle already patched');
  }
} else {
  console.log('react-native-razorpay android/build.gradle not found');
}
