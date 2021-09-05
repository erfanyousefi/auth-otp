module.exports = (req, res, next) => {
    if(req.file){
        req.body[req.file.fieldname] = req.file.filename
    }
    next()
}