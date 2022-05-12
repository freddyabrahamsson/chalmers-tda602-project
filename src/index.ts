import ObfuscationAnalyser from './lib/obfuscation-analyser';

const main = new ObfuscationAnalyser();
main.run().then(() => {
  console.log('Good bye!');
});
