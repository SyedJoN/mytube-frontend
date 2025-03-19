import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/videos"

const fetchVideos = async() => {
    const res = await axios.get(`${BASE_URL}/all-videos`);
    console.log(res.data)
    return res.data; 
}

const publishVideo = async(formData) => {
    const res = await axios.post(`${BASE_URL}/publish-video`, formData, {
        headers: {
            'Content-Type' : 'multipart/form-data'
        }
    });
    console.log(res.data)
    return res.data; 
}


export {fetchVideos, publishVideo}