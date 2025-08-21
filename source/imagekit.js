const imagekit = new ImageKit({
    publicKey: "public_kmXx+UV8zPXkKR0GCMsteUDmPw8=",
    urlEndpoint: "https://ik.imagekit.io/zkzg7rxum5/"
});
function uploadImage() {
    const file = document.getElementById("fileInput").files[0];

    imagekit.upload({
        file: file,
        fileName: file.name,
        useUniqueFileName: false
    }).then(response => {
        console.log("Image URL:", response.url);
        document.getElementById("uploadedImage").src = response.url;
    }).catch(error => {
        console.error("Upload failed:", error);
    });
}
