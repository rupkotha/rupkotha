let bookID, page, pageName, book;


let title, writer, totalPages, formatedPages, proofedPages, bestVolunteer, completed, taskPages = [], lastPageInTask = 0;
let rawText, filterText, latestText, imageLink, format, proof, version, volunteer;

let text, newVolunteer = '', email, uid, credit, lastpage;

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDEaFcnSF0p2AR3JkdyVUgo0Ifno2EfG2M",
    authDomain: "rupkotha.firebaseapp.com",
    databaseURL: "https://rupkotha.firebaseio.com",
    projectId: "rupkotha",
    storageBucket: "rupkotha.appspot.com",
    messagingSenderId: "403571374607",
    appId: "1:403571374607:web:7dac8cb170ab8730"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let db = firebase.database();
let obj = document.getElementById("textid");

function previousPage() {
    page--;
    newPage();
}

function nextPage() {
    page++;
    newPage();
}

function getLatest() {
    obj.value = latestText;

    document.getElementById("version-table").value = version;
    document.getElementById("go-version").value = version;

    document.getElementById("textid").value = latestText;

    document.getElementById("volunteer-table").value = volunteer;
}

function getRaw() {
    obj.value = rawText;
}

function getFilter() {
    obj.value = filterText;
}

function clearTextArea() {
    obj.value = "";
}


function checkSubmit() {
    let proof = document.getElementById("proof-checkbox");
    let format = document.getElementById("format-checkbox");
    let submitbutton = document.getElementById("submit-button");
    if (proof.checked == true && format.checked == true)
        submitbutton.disabled = false;
    else
        submitbutton.disabled = true;
}

function update() {
    data = obj.value;
    newVersion = Number(version) + 1;

    var ref = db.ref("book/" + book + "/pages/" + pageName);
    ref.update({
        "text": data,
        "volunteer": newVolunteer,
        "version": newVersion,
        "format": true,
        "proof": true,
    });



    var ref = db.ref("book/" + book + "/history/" + pageName + "/" + newVersion);
    ref.update({
        "text": data,
        "volunteer": newVolunteer,
    });



    proofedPages[page] = true;
    formatedPages[page] = true;
    var ref = db.ref("book/" + book + "/combine/");
    ref.update({
        "proof": proofedPages,
        "format": formatedPages,
    });


    // var ref = db.ref("book/" + book + "/volunteers/" + uid);
    // ref.update({
    //     "lastpage": Number(page),
    //     "credit": credit + 1,
    // });

    // newPage();
    updateBookDetails();
    incompletedPage();
}


function updateBookDetails() {
    totalProofedPages = 0;
    for (i = 1; i <= proofedPages.length; i++)
        if (proofedPages[i])
            totalProofedPages += 1;

    totalFormatedPages = totalProofedPages;
    completed = (((totalProofedPages) / totalPages) * 100).toFixed(2);

    document.getElementById("bookname-table").value = title;
    document.getElementById("writer-table").value = writer;
    document.getElementById("totalpages-table").value = totalPages;
    document.getElementById("formatedpages-table").value = totalFormatedPages;
    document.getElementById("proofedpages-table").value = totalProofedPages;
    document.getElementById("completed-table").value = completed + '%';
}

function getBookDetails() {
    book = (10000 + bookID).toString();
    ref = db.ref("book/" + book + "/combine");
    ref.on("value", function (snapsot) {
        title = snapsot.val().title;
        writer = snapsot.val().writer;
        totalPages = snapsot.val().pages;
        formatedPages = snapsot.val().format;
        proofedPages = snapsot.val().proof;

        updateBookDetails();
    });
    getTaskedPageNumber();
}


function getTaskedPageNumber() {
    taskPages = [];
    for (let count = 0, i = lastPageInTask + 1; i <= totalPages && count < 5; i++) {
        if (proofedPages[i] == false) {
            count++;
            taskPages.push(i);
            lastPageInTask = i;
        }
    }

    if (taskPages.length == 0) {
        for (i = 0; i < totalPages; i++)
            if (proofedPages[i] == false) {
                lastPageInTask = 0;
                break;
            }

        if (lastPageInTask == 0 && totalPages != undefined) {
            getBookDetails();
            getTaskedPageNumber();
        }
        else
            console.log("All Completed in this book. \nPlease change Book ID");
    }
    console.log(taskPages)
}


function newPage() {
    pageName = (1000 + Number(page)).toString();
    book = (10000 + bookID).toString();


    ref = db.ref("book/" + book + "/pages/" + pageName);

    ref.on("value", function (snapsot) {
        format = snapsot.val().format;
        proof = snapsot.val().proof;
        version = snapsot.val().version;
        volunteer = snapsot.val().volunteer;
        imageLink = snapsot.val().image;

        rawText = snapsot.val().raw;
        filterText = snapsot.val().filter;
        latestText = snapsot.val().text;


        document.getElementById("bookid-table").value = book;
        document.getElementById("page-table").value = page;
        document.getElementById("version-table").value = version;
        document.getElementById("proof-table").value = proof ? "Yes" : "NO";
        document.getElementById("format-table").value = format ? "Yes" : "NO";
        document.getElementById("volunteer-table").value = volunteer;
        document.getElementById("page-image-table").href = imageLink;

        document.getElementById("bookid-nav").value = Number(book);

        document.getElementById("bookid-table-right").value = book;

        document.getElementById("go-bookid").value = Number(book);
        document.getElementById("go-page").value = page;



        document.getElementById("textid").value = latestText;
        document.getElementById("imageid").src = imageLink;


        document.getElementById("go-version").value = version;
    });

    document.getElementById("proof-checkbox").checked = false;
    document.getElementById("format-checkbox").checked = false;
    document.getElementById("submit-button").disabled = true;
}

function goPage() {
    page = Number(document.getElementById("go-page").value)
    bookID = Number(document.getElementById("go-bookid").value) - 10000;
    newPage();
}

function goVersion() {
    oldVersion = Number(document.getElementById("go-version").value);

    ref = db.ref("book/" + book + "/history/" + pageName + "/" + oldVersion);
    ref.on("value", function (snapsot) {

        oldText = snapsot.val().text;
        oldVolunteer = snapsot.val().volunteer;

        document.getElementById("version-table").value = oldVersion;
        document.getElementById("go-version").value = oldVersion;

        document.getElementById("textid").value = oldText;

        document.getElementById("volunteer-table").value = oldVolunteer;

    });
}


function incompletedPage() {
    if ((totalProofedPages != totalPages) && (page + 1) > totalPages)
        page = 0;

    for (i = page + 1; i <= totalPages; i++) {
        if (proofedPages[i] == false) {
            page = i;
            newPage();
            break;
        }
    }
}

function registration() {
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function (user) {
        window.location.href = 'index.html'

        //Here if you want you can sign in the user
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        alert(errorMessage)
    });
}

function isLogin() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            uid = user.uid;
            var providerData = user.providerData;

            newVolunteer = email;

            document.getElementById("profile-button").innerHTML = email;
            // ...
        } else {
            // User is signed out.
            // ...
            window.location.href = 'login.html'
        }
    });
}

function login() {
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function onSuccess(...args) {
            window.location.href = 'index.html'
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            alert(errorMessage)
        });
}

function logout() {
    firebase.auth().signOut().then(function () {
        window.location.href = "index.html"
    }).catch(function (error) {
        // An error happened.
        alert(error)
    });
}

function reduceWidth(){
    let image = document.getElementById("imageid");
    image.style.width = (image.clientWidth - 100) + 'px'
}

function increaseWidth(){
    let image = document.getElementById("imageid");
    image.style.width = (image.clientWidth + 100) + 'px'
}

function reduceHeight(){
    let image = document.getElementById("imageid");
    image.style.height = (image.clientHeight - 100) + 'px'
}

function increaseHeight(){
    let image = document.getElementById("imageid");
    image.style.height = (image.clientHeight + 100) + 'px'
}

function initial() {
    // isLogin();
    bookID = 1;
    book = (10000 + bookID).toString();


    // ref = db.ref("/book/10006/volunteers/ZFEQBIt3FCTgxJt3MhuP7PF23eF2");
    // ref = db.ref("book/" + book + "/volunteers/" + uid);

    // ref.on("value", function (snapsot) {
    //     console.log(snapsot.val())
    //     lastpage = snapsot.val().lastpage;
    //     credit = Number(snapsot.val().credit);
    // });

    lastpage = 11;
    page = lastpage;
    newPage();
    // getBookDetails();
}