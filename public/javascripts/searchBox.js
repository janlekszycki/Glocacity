let searchbox = document.getElementById("searchbox");
let searchboxframe = document.getElementById("searchboxframe");

searchbox.addEventListener("keyup", async () => {
    if (searchbox.value) {
        fetch(`/ranges/search?query=${searchbox.value}`)
            .then((result) => {
                result.json()
                    .then((result) => {
                        if (result.length) {
                            let resultcard = document.getElementById("resultcard");
                            if (resultcard) { resultcard.remove() };
                            let resultbox = document.createElement("div");
                            resultbox.className = "card mt-1 position-absolute top-100 w-100";
                            resultbox.id = "resultcard";
                            let resultboxlist = document.createElement("div");
                            resultboxlist.className = "card-body";
                            result.forEach((resItem) => {
                                let listItem = document.createElement("a");
                                listItem.className = "link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover";
                                listItem.setAttribute("href", `/ranges/${resItem._id}`);
                                let icon = document.createElement("i");
                                icon.className = "bi bi-geo-alt";
                                listItem.innerText = `${resItem.title} `;
                                listItem.append(icon);
                                if (result.length >= 1) {
                                    listItem.append(document.createElement("br"))
                                }
                                resultboxlist.appendChild(listItem);
                            });
                            resultbox.appendChild(resultboxlist);
                            searchboxframe.appendChild(resultbox);
                        } else {
                            let resultcard = document.getElementById("resultcard");
                            // resultcard = resultcard.append(document.createElement("div"));
                            if (resultcard) { resultcard.remove() };
                        };
                    });
            })
    }
});
