import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
       name:{
            type:String,
            required:true

       },
         
       email:{
            type:String,
            required:true,
            unique:true
         },
        password:{
            type:String,
            required:true

        },
        image:{
            type:String,
            required:true
        },
        spetiality:{
            type:String,
            required:true
        },
        degree:{
            type:String,
            required:true

        },
        experiance:{
            type:String,
            required:true
        },
        available:{
            type:Boolean,
            required:true
        },
        fees:{
            type:Number,
            required:true
        },
        address:{
            type:number,
            required:true
        },
        date:{
            type:Number,
            required:true
        },
        slots_booked:{
            type:Object,
            required:{}
        }







    },{minimize:false}
)
const doctorModel=mongoose.models.doctor|| mongoose.model('doctor',doctorSchema);

export default doctorModel;