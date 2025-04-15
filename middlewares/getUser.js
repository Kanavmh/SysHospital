module.exports.getUser = (req, res, next)=>{
    const data = req.cookies?.user;
    if(data){
        req.user = data;
    }
    next();
}