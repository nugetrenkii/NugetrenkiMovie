import Reactotron from 'reactotron-react-native';

/**
 * Cấu hình Reactotron cho React Native
 *
 * Cách sử dụng:
 * 1. Cài app Reactotron Desktop: https://github.com/infinitered/reactotron/releases
 * 2. Mở Reactotron Desktop trước khi chạy app
 * 3. iOS Simulator tự kết nối localhost
 * 4. Android Emulator: chạy `adb reverse tcp:9090 tcp:9090`
 */

const reactotron = Reactotron
  .configure({
    name: 'NugetrenkiMovie',
    // host: '192.168.x.x', // Bỏ comment và đổi IP khi debug trên device thật
  })
  .useReactNative({
    asyncStorage: false, // Bật nếu đã cài @react-native-async-storage
    networking: {
      ignoreUrls: /symbolicate|logs/, // Bỏ qua các request hệ thống
    },
    editor: false,
    errors: { veto: () => false },
    overlay: false,
  })
  .connect();

// Ghi đè console.tron để dùng ở bất kỳ đâu trong app
declare global {
  interface Console {
    tron: typeof reactotron;
  }
}
console.tron = reactotron;

export default reactotron;
