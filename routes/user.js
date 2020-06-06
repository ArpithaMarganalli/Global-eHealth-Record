const { check, validationResult } = require('express-validator');

const crypto = require('crypto'),
    passwordValidator = require('password-validator'),
    cron = require('node-cron'),
    nodemailer = require('nodemailer'),
    maskdata = require('maskdata'),
    tinyURL = require('tinyurl');

var mailConfig = require('../config/email'),
    hbs = require('nodemailer-express-handlebars'),
    gmailTransport = mailConfig.GmailTransport;

const algorithm = 'aes-256-ctr';
const encKey = "Raj is great.";

let schema = new passwordValidator();
let environment = process.env;

const defaultPhoneMaskOptions = {
    maskWith: "*",
    unmaskedStartDigits: 4,
    unmaskedEndDigits: 1
};

const defaultEmailMaskOptions = {
    maskWith: "*",
    unmaskedStartCharacters: 3,
    unmaskedEndCharacters: 2,
    maskAtTheRate: false,
    maxMaskedCharactersBeforeAtTheRate: 10,
    maxMaskedCharactersAfterAtTheRate: 10,
};

const defaultJsonMaskOptions = {
    maskWith: "*",
    fields: []
};

const defaultPasswordMaskOptions = {
    maskWith: "*",
    maxMaskedCharacters: 16,
    unmaskedStartDigits: 4,
    unmaskedEndDigits: 1
};

const defaultStringMaskOptions = {
    maskWith: "*",
    maskOnlyFirstOccurance: false,
    unmaskedStartDigits: 4,
    unmaskedEndDigits: 1,
    values: []
};

const defaultCardMaskOptions = {
    maskWith: "*",
    unmaskedStartDigits: 4,
    unmaskedEndDigits: 1
};

schema
    .is().min(6) // Minimum length 8
    .is().max(18) // Maximum length 18
    .has().uppercase() // Must have uppercase letters
    .has().lowercase() // Must have lowercase letters
    .has().digits() // Must have digits
    .has().not().spaces() // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

//--------------------------------- signup page call ------------------------------
exports.signup = function (request, response) {
    message = '',
        signUpError = '',
        sess = request.session,
        companyInsertedId = 0;
    if (request.method == "POST") {

        let post = request.body,
            first_name = post.first_name,
            last_name = post.last_name,
            user_mobile = post.countrycode + post.user_mobile,
            login_email = post.login_email,
            password = post.password,
            user_type = post.user_type,
            company_name = post.company_name,
            registration_id = post.registration_id,
            designation = post.designation,
            a_first_name = post.a_first_name,
            a_last_name = post.a_last_name,
            a_email_id = post.a_email_id,
            a_mobile_number = post.a_mobile_number,
            a_designation = post.a_designation;

        let company_hash = crypto.createHash('sha256').update(company_name + registration_id + "dfs@209$/hr").digest('hex');

        let insertSQL = "INSERT INTO `healthrecord`.`company` (`first_name`, `last_name`, `user_mobile`, `login_email`, `password`, `user_type`, `company_name`, `registration_id`, `designation`, `company_hash`)  VALUES ('"
            + first_name + "', '" + last_name + "', '" + user_mobile + "', '" + login_email + "', '" + password + "', '" + user_type + "', '" + company_name + "', '" + registration_id + "', '" + designation + "', '" + company_hash + "')";

        if (typeof (a_first_name) != "undefined" && a_first_name.length > 0) {
            let a_user_type = 'Admin User';
            if (Array.isArray(a_first_name)) {
                for (let step = 0; step < a_first_name.length; step++) {
                    let passcode = Math.floor(100000 + Math.random() * 900000);
                    insertSQL = insertSQL + ", ('" + a_first_name[step] + "', '" + a_last_name[step] + "', '" + a_mobile_number[step] + "', '" + a_email_id[step] + "', '" + passcode + "', '" + a_user_type + "', '" + company_name + "', '" + registration_id + "', '" + a_designation[step] + "', '" + company_hash + "')";
                    sendMails(a_first_name[step], a_email_id[step], passcode, company_name, environment.REGISTRATION_COMPLETED, environment.REGISTRATION_MESSAGE);
                }
            } else {
                let passcode = Math.floor(100000 + Math.random() * 900000);
                insertSQL = insertSQL + ", ('" + a_first_name + "', '" + a_last_name + "', '" + a_mobile_number + "', '" + a_email_id + "', '" + passcode + "', '" + a_user_type + "', '" + company_name + "', '" + registration_id + "', '" + a_designation + "', '" + company_hash + "')";
                sendMails(a_first_name, a_email_id, passcode, company_name, environment.REGISTRATION_COMPLETED, environment.REGISTRATION_MESSAGE);
            }
        }

        request.method = "GET";

        let existSQL = "SELECT companyId FROM `healthrecord`.`company` WHERE `login_email`='" + login_email + "' OR user_mobile = '" + user_mobile + "' AND registration_id = '" + registration_id + "'";

        db.query(existSQL, function (err, results) {
            if (typeof (results) != "undefined" && results.length > 0) {
                message = 'User already exist!! Please Login with the same email.';
                response.render('index.ejs', { message: message });
            }
        });
        
        let register = db.query(insertSQL, function (err, result) {
            if (err) {
                signUpError = err;
                response.render('signup.ejs', { message: 'Error occured. Please try after some time.' });
            } else {
                sendMails(first_name, login_email, password, company_name, environment.REGISTRATION_COMPLETED, environment.REGISTRATION_MESSAGE);
                console.log("Else... " + result.insertId);
                companyInsertedId = result.insertId*1;
            }
        });
        console.log("========== companyInsertedId: " + register);

        if (register.length > 0) {
            let questionQuery = "INSERT INTO `healthrecord`.`question` (`form_id`, `question_type`, `question_description`, `question_options`) VALUES ('"
                + companyInsertedId + "', 'boolean', '" + environment.QUESTION1 + "', 'yes,no'), ('"
                + companyInsertedId + "', 'boolean', '" + environment.QUESTION2 + "', 'yes,no'), ('"
                + companyInsertedId + "', 'boolean', '" + environment.QUESTION3 + "', 'yes,no'), ('"
                + companyInsertedId + "', 'boolean', '" + environment.QUESTION4 + "', 'yes,no'), ('"
                + companyInsertedId + "', 'boolean', '" + environment.QUESTION5 + "', 'yes,no')";

            console.log("questionQuery: " + questionQuery); 
            console.log("InsertID: " + companyInsertedId);

            let questionsObj =  db.query(questionQuery, function (err, qResultObj) {
                if (qResultObj.length) {
                    console.log("Query: " + questionQuery);
                    console.log("Value: " + qResultObj);
                } else {
                    console.log("Query: " + questionQuery);
                    console.log("Error: " + err)
                }
             });
        }
        
        let loginSQL = "SELECT * FROM `healthrecord`.`company` WHERE `login_email`='" + login_email + "' AND password = '" + password + "'";

        db.query(loginSQL, function (err, results) {
            if (results.length) {
                sess.user = results[0];
                sess.login_email = login_email;
                sess.companyId = results[0].companyId;
                sess.company_hash = results[0].company_hash;
                response.redirect('/home/dashboard');
            } else {
                message = 'Error occured. Please try after some time.';
                response.render('index.ejs', {
                    message: message
                });
            }
        });
    } else {
        response.render('signup');
    }
};

//-------------------------------- ecnrypt data call ------------------------------
function encrypt(encKey, password) {
    let cipher = crypto.createCipher(algorithm, password),
        crypted = cipher.update(encKey, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

//-------------------------------- decrypt data call ------------------------------
function decrypt(encKey, password) {
    let decipher = crypto.createDecipher(algorithm, password),
        dec = decipher.update(encKey, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

//-------------------------------- sending email call -----------------------------
function sendMails(userName, userEmail, userPassword, companyName, mailSubject, userMessage) {
    const output = `
        <b>Dear ` + userName + `</b>
        <h4>` + mailSubject + `</h4>
        <p>You have been added as Admin User for Global eHealth Declaration Solution. Below are the credentials you can use to login.</p>
        <ul>  
            <li>Company: ` + companyName + `</li>
            <li>Login URL: <a href='http://www.labmoneta.co/eHealth/login'>http://www.labmoneta.co/eHealth/login</a></li>
            <li>Login ID: ` + userEmail + `</li>
            <li>Password: ` + userPassword + `</li>
        </ul>
        <h4>LabMoneta Global eHealth Declaration Solution team wishes everyone's good health and vigilant.</h4>
        <p>Regards,<br/> 
        LabMoneta Global eHealth Solution Team
        <p>` + userMessage + `</p>
        </p>`;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: environment.GMAIL_SERVICE_HOST,
        port: environment.GMAIL_SERVICE_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: environment.GMAIL_USER_NAME,
            pass: environment.GMAIL_USER_PASSWORD  // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Global eHealth Declaration" <' + environment.GMAIL_USER_NAME + '>', // sender address
        to: userEmail, // list of receivers
        subject: mailSubject, // Subject line
        text: 'Registration Details', // plain text body
        html: output // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        // res.render('contact', {msg:'Email has been sent'});
    });
};

//-------------------------------- login page call --------------------------------
exports.login = function (request, response) {
    let message = '',
        sess = request.session;

    if (request.method == "POST") {
        let post = request.body,
            login_email = post.login_email,
            password = post.password;

        let loginSQL = "SELECT * FROM `healthrecord`.`company` WHERE `login_email`='" + login_email + "' AND password = '" + password + "'";

        db.query(loginSQL, function (err, results) {
            if (results.length) {
                const userObj = results[0];
                sess.user = userObj;
                sess.login_email = login_email;
                sess.companyId = userObj.companyId;
                sess.company_hash = userObj.company_hash;
                // / TEST email
                // sendMails(userObj.first_name, userObj.login_email, userObj.password, userObj.companyId, environment.REGISTRATION_COMPLETED, 'For any support email us: raj@labmoneta.co')
                response.redirect('/home/dashboard');
            } else {
                message = 'Wrong Credentials.';
                response.render('index.ejs', {
                    message: message
                });
            }
        });
    } else {
        response.render('index.ejs', {
            message: message
        });
    }
};

//-------------------------------- dashboard page functionality -------------------
exports.dashboard = function (request, response, next) {
    let formURL = '/';

    // const ipInfo = request.ipInfo;
    // let message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;

    const user = request.session.user,
        companyId = request.session.companyId,
        company_hash = request.session.company_hash,
        qrString = 'http://' + request.get('host') + formURL + 'recordform/' + company_hash;

    let tinyLink = '';

    if (companyId == null || undefined == companyId) {
        response.redirect("/login");
        return;
    }

    user.company_hash = company_hash;
    user.urlHashCode = crypto.createHash('sha256').update(formURL + "dhanrajdadhich").digest('hex');
    user.qrString = qrString;

    let sql = "SELECT * FROM `healthrecord`.`company` WHERE `companyId`='" + companyId + "' AND company_hash = '" + company_hash + "'";

    db.query(sql, function (err, results) {
        tinyURL.shorten(qrString, function (res, err) {
            if (err) {
                console.log(err)
            } else {
                user.tinyLink = res;
                response.render('dashboard.ejs', {
                    user: user
                });
            }
        });
    });
};

//-------------------------------- logout functionality ---------------------------
exports.logout = function (request, response) {
    request.session.destroy(function (err) {
        response.redirect("/login");
    })
};

//-------------------------------- display records --------------------------------
exports.records = function (request, response) {
    const user = request.session.user,
        companyId = request.session.companyId,
        company_hash = request.session.company_hash;

    if (companyId == null || undefined == companyId) {
        response.redirect("/login");
        return;
    }

    let sql = "SELECT `firstname`,`last_name`,`nircpassport`,`emailid`,`mobileno`,`body_temp`, `answers` FROM `healthrecord`.`record` WHERE `company_hash`='" + company_hash + "'";
    db.query(sql, function (err, result) {
        response.render('records.ejs', {
            data: result,
            request: request,
            user: user
        });
    });
};

//-------------------------------- edit question ----------------------------------
exports.question = function (request, response) {
    let message = '';
    const user = request.session.user,
        companyId = request.session.companyId,
        company_hash = request.session.company_hash;
    if (companyId == null || undefined == companyId) {
        response.redirect("/login");
        return;
    } else {
        db.query("SELECT * FROM `healthrecord`.`question` WHERE `form_id`='" + companyId + "'", function (err, results) {
            console.log(results);
            if (results.length) {
                response.render('questions.ejs', {
                    data: results,
                    request: request,
                    user: user
                });
            } else {
                message = 'Access denied.';
                response.render('index.ejs', {
                    message: message
                });
            }
        });
    }
};

//-------------------------------- recordform page call ---------------------------
exports.recordform = function (request, response) {
    message = '', company_hash = request.params.formId;

    if (request.method == "GET") {
        db.query("SELECT * FROM `healthrecord`.`company` WHERE `company_hash`='" + company_hash + "'", function (err, results) {
            if (results.length > 0) {
                request.session.formId = company_hash;
                request.session.companyId = results[0].companyId;
                response.render('recordform.ejs', {
                    data: results,
                    message: message,
                    request: request
                });
            } else {
                request.session.formId = 'b6b3971c7606c8477f9a7c2afa8f6f07e4d42d330a73b39e7b536e63cad7430c';
                request.session.companyId = '208';
                const results = [{
                    'company_name': 'LAB MONETA FOUNDATION PRIVATE LIMITED',
                    'formId': 'b6b3971c7606c8477f9a7c2afa8f6f07e4d42d330a73b39e7b536e63cad7430c',
                    'companyId': '208'
                }];
                response.render('recordform.ejs', {
                    data: results,
                    message: message,
                    request: request
                });
            }

        });
    } else if (request.method == "POST") {
        if (typeof request.body.formId == 'undefined' || '' === request.body.formId) {
            message = "Issue in submitting details.. Please try again in some time.";
            response.render('thanks.ejs', {
                message: message
            });
        }
        let first_name = request.body.first_name,
            last_name = request.body.last_name,
            nirc_passport = request.body.nirc_passport,
            email_id = request.body.email_id,
            mobile_no = request.body.countrycode + request.body.user_mobile,
            body_temp = request.body.body_temp,
            firstname = maskdata.maskPassword(request.body.first_name, defaultPasswordMaskOptions),
            nircpassport = maskdata.maskPassword(request.body.nirc_passport, defaultPasswordMaskOptions),
            emailid = maskdata.maskEmail(request.body.email_id, defaultEmailMaskOptions),
            mobileno = maskdata.maskPhone(request.body.user_mobile, defaultPhoneMaskOptions),

            // pulse_rate = request.body.pulse_rate,
            // body_weight = request.body.body_weight,
            form_id = request.session.companyId,
            company_hash = request.body.formId,
            answers = JSON.stringify(request.body);

        let formInsertQuery = "INSERT INTO `healthrecord`.`record` (`first_name`,`firstname`,`last_name`,`nirc_passport`,`nircpassport`,`email_id`,`emailid`,`mobile_no`,`mobileno`,`body_temp`,`form_id`, `company_hash`,`answers`) VALUES ('" + first_name + "', '" + firstname + "', '" + last_name + "', '" + nirc_passport + "', '" + nircpassport + "', '" + email_id + "', '" + emailid + "', '" + mobile_no + "', '" + mobileno + "', '" + body_temp + "', '" + form_id + "', '" + company_hash + "', '" + answers + "')";
        let urlString = 'http://' + request.get('host') + '/recordform/' + company_hash;
        let register = db.query(formInsertQuery, function (err, result) {
            message = "Please show this page to the Security Officer as you approach the entrace. If any of your responses submitted is a 'Yes'.";
            let message1 = "Please do not enter the building. Thank you for your cooperation and understanding."
            response.render('thanks.ejs', {
                message: message,
                message1: message1,
                urlStr: urlString,
                err: err
            });
        });

    } else {
        response.render('recordform');
    }
};