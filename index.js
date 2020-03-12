var express=require('express');
var app=express();
var cors=require('cors');
var bodyParser=require('body-parser');

const fs = require('fs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use(express.json());


//Testing server
app.get('/ping',(req,res)=>{
    res.send("Pong");
})




app.post('/calculateCoordinate',(req,res)=>{
    let initialHeight=req.body['initialHeight'];
    let heightVal =initialHeight;
    let coef=req.body['coeff'];
    heightTimeCoordinates=[];
    //Initial time ... time is added as the ball continues bouncing
    runningTime=0;
    //Firstly height time cordinates will be initial height and 0th time
    heightTimeCoordinates.push({'height':heightVal,'time':runningTime});
    var distanceTravelled=heightVal;
    
    const gravity=9.8;

    //restitution coefficent formula    e^2 * originalHeight=AfterDropHeight  


     //let us consider that if height is less than 0.05  metres then I will consider that as the last bounce
     //Else if I don't consider that it will be infinity.

     //For downward time  multiply height by 2 and divide by gravity ...square root the result
     // that is squareRoot((h*2)/9.8)
    var downwardTime=Math.sqrt((heightVal*2)/gravity);
    runningTime+=downwardTime;

    //Second time height will be 0 ( as ball will touch ground ) and time will be time taken to drop
    heightTimeCoordinates.push({'height':0,'time':runningTime});
    //For upward time v^2 = u^2 + 2as 
    //where v will be 0 and u wil be found
    //Now v=u+at   v is 0 , u we have , a is 9.8 and time can be found.

    //Therefore value of i will give no of bounces

    //therefore cooridinates will look something like this ([h1,runningTime],[0,runningTime],[h2,runningTime],[0,runningTime])


    var i=1;

    for(i=1;heightVal>0.05;i++){
        let newHeight=coef*coef * heightVal;

        //Calculate time 
        //For upward time v^2 = u^2 + 2as  i.e -u^2=-2gs
        //where v will be 0 and u wil be found
        //Now v=u+at   v is 0 , u we have , a is 9.8 and time can be found.  i.e  -u=-at

        let initialVelocity=Math.sqrt(2*gravity*newHeight);

        let upwardTime=initialVelocity/gravity;
        runningTime+=upwardTime;

        heightTimeCoordinates.push({'height':newHeight,'time':runningTime})

        //For downward time  multiply height by 2 and divide by gravity ...square root the result
         // that is squareRoot((h*2)/9.8)
         let downwardTime=Math.sqrt((heightVal*2)/gravity);
         runningTime+=downwardTime;

        heightTimeCoordinates.push({'height':0,'time':runningTime})

        heightVal=newHeight;
        distanceTravelled+=(2*newHeight);
   }

  
           returnJson= {
                'initialHeight':initialHeight,
                'coefRest':coef,
                'heightTimeCoordinate':heightTimeCoordinates, 
                'distanceTravelled':distanceTravelled,
                'noOfBounces':i
            };
            
            //let stringifiedData=JSON.stringify(returnJson);

            var fileJson=[];

            //Check for ENOENT file not found error
            try{
                let rawdata = fs.readFileSync('CoordinatesStore.json');
                //Check whether file is empty or not if it is then no need to get value from it.
                if(rawdata.length!=0){
                    
                    fileJson = JSON.parse(rawdata);
                }

            }
            catch(err){
                console.log("File doesn't exist ....Creating the file for the first time ..");
                
            }
           try{
                fileJson.push(returnJson);
                fs.writeFileSync('CoordinatesStore.json', JSON.stringify(fileJson));
                res.send(returnJson);
           }
           catch(err){
            res.status(404).send("Error while writing to file");
           }
           
})



app.get('/getHistory',(req,res)=>{
    try{
        let rawdata = fs.readFileSync('CoordinatesStore.json');
        let student = JSON.parse(rawdata);
        res.send(student);

    }
    catch(err){
        res.status(404).send("Error while reading file...Please check if file exist or firstly try inserting some json using calculate cordinate api's");
    }
    
})
app.listen(3000,()=>{
    console.log("welcome to server");
})