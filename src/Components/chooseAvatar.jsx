import React from 'react'

function chooseAvatar() {
  return (
    <>
    <Typography color="#fff" mt={2} gutterBottom>
    Choose Avatar
  </Typography>
  <Input
    type="file"
    accept="image/*"
    onChange={(e) => handleFileChange(e, setAvatar)}
    fullWidth
  />
  {avatar && (
    <img
      src={avatar}
      alt="Avatar Preview"
      style={{
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        marginTop: "10px",
      }}
    />
  )}

  {/* Cover Image Upload */}
  <Typography color="#fff" mt={2} gutterBottom>
    Choose Cover Image
  </Typography>
  <Input
    type="file"
    accept="image/*"
    onChange={(e) => handleFileChange(e, setCoverImage)}
    fullWidth
  />
  {coverImage && (
    <img
      src={coverImage}
      alt="Cover Preview"
      style={{ width: "100%", height: "150px", marginTop: "10px" }}
    />
  )}

  <Button
    type="submit"
    variant="contained"
    fullWidth
    sx={{ mt: 2, borderRadius: "20px", backgroundColor: "#A8C7FA" }}
  >
    Sign Up
  </Button>
  </>
  )
}

export default chooseAvatar