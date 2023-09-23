
module.exports = (a) => {
    if (a.length) {
        let avgRating = 0;
        a.forEach((e) => avgRating += e.rating);
        a.avgRating = (avgRating / a.length).toFixed(1);
        a.fullStars = Math.floor(a.avgRating);
        a.halfStars = (a.avgRating - Math.floor(a.avgRating) > 0.4) ? 1 : 0;
        a.emptyStars = 5 - a.fullStars - a.halfStars;
    }
    return a
}
