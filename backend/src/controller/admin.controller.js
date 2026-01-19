import {Song} from "../models/song.model.js";
import {Album} from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

//helper fun for cloudinary uploads
const uploadToCloudinary = async (file) =>{
  try {
    const result= await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    }
  )
  return result.secure_url
  } catch (error) {
    console.log("error in uploadToCloudinary",error);
    throw new Error("error uploading in cloudinary");
  }
};

export const createSong = async (req,res,next)=>{
  try {
    if(!req.files || !req.files.audioFiles || !req.files.imageFile){
      return res.status(400).json({message: "please upload all files"});
    }

    const{ title, artist, albumId, duration}= req.body
    const audioFile= req.files.audioFile;
    const imageFile= req.files.imageFile;

    const audioUrl= await uploadToCloudinary(audioFile);
    const imageUrlUrl= await uploadToCloudinary(imageFile);

    const song= new Song({
      title,
      artist,
      audioUrl,
      imageUrl,
      duration,
      albumId: albumId || null
    })

    await song.save( )

    //if song belongs to album update the albums arr
    if(albumId){
      await Album.findByIdAndUpdate(albumId, {
        $push:{ songs : song.id},
      });
    }
    res.send(201).json(song)
  } catch (error) {
    console.log("Error in createSong",error);
    next(error);
  }
};


export const deleteSong= async(req, res, next)=>{
  try {
    const {id }= req.params

    const song = await Song.findById(id)

    //if song belong to album, update the album song array
    if(song.albumId){
      await Album.findByIdAndUpdate(song.albumId,{
        $pull: {songs:song._id},
      })
    }

    await Song.findByIdAndDelete(id)

    res.status(200).json({message:"song deleted successfully"});

  } catch (error) {
    console.log("error in deleteSong", error);
    next(error);
  }
};

export const createAlbum= async(req,res,next)=> {
  try {
    const{title,artists,releseYear} = req.body
    const {imageFile}= req.files

    const imageUrl= await uploadToCloudinary(imageFile)

    const album= new Album({
      title,
      artist,
      imageUrl,
      releaseYear
    })

    await album.save();

    res.status(201).json(album);
  } catch (error) {
    console.log("error in createalbum ", error);
    next(error);
  }
};

export const deleteAlbum= async(req,res,next)=> {
  try {
    const {id}= req.params;
    await Song.deleteMany({albumId: id});
    await Album.findByIdAndDelete(id);

    res.status(200).json({message: "Album deleted Successfully"});
  } catch (error) {
    console.log("Error in deleteAlbum", error);
    next(error);
  }
};

export const checkAdmin= async(req,res,next)=>{
  res.status(200).json({admin:true});
};