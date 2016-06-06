var exec = require('child_process').exec;

if(process.argv.length < 5){
	console.log('usage: node android.js [keystore locaiton] [keystore password] [key password]');
	return;
}

var funcs = [
	{
		message: 'cleaning...',
		func: 'rm android-release.apk',
		continue: true
	},
	{
		message: 'building...',
		func: 'cordova build --release android',
	},
	{
		message: 'signing...',
		func: 'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ' + process.argv[2] + ' -storepass ' + process.argv[3] + ' -keypass ' + process.argv[3] + ' ../platforms/android/build/outputs/apk/android-release-unsigned.apk com.adittech.FishingCatalog'
	},
	{
		message: 'aligning...',
		func: 'zipalign -v 4 ../platforms/android/build/outputs/apk/android-release-unsigned.apk android-release.apk'
	}	
];

var child, index = -1;

function next(){
	index++;
	if(funcs.length > index){
		if(funcs[index].message){
			console.log(funcs[index].message);
		}
		child = exec(funcs[index].func, function(error, stdout, stderr){
			if(error){
				err = true;
				console.log('error starting process: ' + error);
			}
			if(stderr){
				console.log('error :' + stderr);
			}
		});
		child.on('exit', next);
	}
}

next();