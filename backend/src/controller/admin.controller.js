import {song} from "../models/song.model.js";
import {Album} from "../models/album.model.js";

export const createSong = async (req,res,next)=>{
  try {
    if(!req.files || !req.files.audioFiles || !req.files.imageFile){
      return res.status(400).json({message: "please upload all files"});
    }

    const{ title, artist, albumId, duration}= req.body
    const audioFile= req.files.audioFile
    const imageFile= req.files.imageFile

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