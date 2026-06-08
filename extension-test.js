// Minimal test to verify extension works
console.log('Extension loaded!');
console.log('Testing extension...');

module.exports = function(pi) {
   console.log('Extension called with pi:', typeof pi);
   return {
      name: 'test-extension',
      activate: () => console.log('Test extension activated!')
   };
};

console.log('Extension test module ready');
