// api for adding doctor 

const addDoctor = async (req, res) => {
    try {
        const { name, email, password ,specialization, fees, phone, address,degree,about ,experiance}= req.body;
        const image = req.file.path;
        console.log({ name, email, password ,specialization, fees, phone, address,degree,about ,experiance},image);
        
    } catch (error) {
        
    }
}
export {addDoctor};