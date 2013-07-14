/*
http://heyfaisal.com/app.lied.at/login.php
http://appliedat.com/login.php
http://mylocalhost/Appliedat/login.php
 */
var localDebug = false;
var domain = '';
if (localDebug) {
  domain = "http://mylocalhost/Appliedat/";
} else {
  domain = "http://appliedat.com/";
}
var loginURL = domain + "login.php";
var addJobURL = domain + "addJob.php";
var homeURL = domain + "home.php";

var haveLogins = false,
User = '',
Pass = '';



function CreateBox() {
  //evt_Name, evt_Date, evt_Where, evt_OtherDetails, evt_List
  var el = document.createElement('div');
  var s = "<div class='header'>Add to Applied.at<span id='close' style='font-size: 17px;font-weight: bold; color#333;right: 10px;position: absolute;'>X</span></div><div class='main'><div class='login' style='display:none'><br><div class='row'><span>Please update your Appliedat.com credentials to Save jobs in your account. <br>If not signed up, please signup here <a href='http://appliedat.com/signup.php' target='_blank'>Sign up</a></span><br><br></div><div class='row'><span>Username</span><br /><input type='text' id='appliedat_username' /></div><div class='row'><span>Password</span><br /><input type='password' id='appliedat_password' /></div><div class='row' style='display:none' id='saved_info'><span style='color:#0099CC;'>Your account details have been saved successfully. <br>You can start using the extension now to save job listings..</span></div><a id='btnSaveLogin' class='appliedat_button'>Update</a></div><div class='content'><div class='row'><span>Title</span><br /><input type='text' id='appliedat_SiteName' /></div><div class='row'><span>Saved Date &amp; Time</span><br /><input type='text' id='appliedat_SaveDate' /></div><div class='row'><span>URL</span><br /><input type='text' id='appliedat_Url' /></div><div class='row'><span>Job Description</span><br /><textarea id='appliedat_Description'></textarea></div><div class='row'><span>Personal Note</span><br /><input type='text' id='appliedat_Notes' /></div><div class='row'><span>Did you apply for this job?</span> &nbsp;&nbsp; <input type='radio' name='applied' value='1' />Applied &nbsp;&nbsp; <input type='radio' name='applied' value='0' checked='checked' />Didn&#39;t Apply</div><div class='row reminder' style='display:none'><div><input type='checkbox' checked='checked' />&nbsp;&nbsp; Remind me to follow-up when? (Y/m/d format) <input type='text' id='appliedat_reminderDate' /></div></div><a id='btnSaveJob' class='appliedat_button'>Save</a></div></div><div class='footer'><a href='http://appliedat.com/home.php' target='_blank'>Recently Saved&nbsp;&nbsp;/</a><a href='http://appliedat.com/applied.php' target='_blank'>Applied Jobs&nbsp;&nbsp;/</a><a href='http://appliedat.com/help.php' target='_blank'>Help</a>";
  el.setAttribute("id", "appliedat-wrapper");
  el.setAttribute("style", "display:none");
  
  document.body.appendChild(el);
  el.innerHTML = s;
  document.querySelectorAll('#appliedat-wrapper input[type=radio]')[0].onclick = function () { //Applied clicked
    document.querySelector('#appliedat-wrapper .reminder').style.display = 'block';
    //document.querySelector('#appliedat-wrapper').style.height = '670px';
  }
  document.querySelectorAll('#appliedat-wrapper input[type=radio]')[1].onclick = function () { //Not Applied clicked
    document.querySelector('#appliedat-wrapper .reminder').style.display = 'none';
    //document.querySelector('#appliedat-wrapper').style.height = '600px';
    document.querySelector('#appliedat-wrapper #appliedat_reminderDate').checked = false;

  }
  document.querySelector('#appliedat-wrapper #close').onclick = function () {
    document.getElementById('appliedat-wrapper').style.display = 'none';
  }
  document.querySelector('#appliedat-wrapper #btnSaveLogin').onclick = function () {
    if(document.getElementById('appliedat_username').value!='' && document.getElementById('appliedat_password').value!=''  ){
      chrome.runtime.sendMessage({
        type : "saveLogins",
        username:document.getElementById('appliedat_username').value,
        password:document.getElementById('appliedat_password').value
      }, function (response) {
        haveLogins = response.haveLogins;
        User = response.User;
        Pass = response.Pass;
        document.querySelector('#appliedat-wrapper #saved_info').style.display='block';
         document.querySelector('#appliedat-wrapper #btnSaveLogin').style.display='none';
        setTimeout(function(){
          document.querySelector('#appliedat-wrapper .main .login').style.display='none';
          document.querySelector('#appliedat-wrapper .main .content').style.display='block';
        },1500);  
      });
      }
  }
  document.querySelector('#appliedat-wrapper #btnSaveJob').onclick = function () {
      var xmlhttp = new XMLHttpRequest;
      var authUrl = addJobURL;
      var applied = (document.querySelectorAll('#appliedat-wrapper input[type=radio]')[0].checked ? '1' : '0');
      var authData = [
        "username=" + encodeURIComponent(User),
        "password=" + encodeURIComponent(Pass),
        "site_name=" + encodeURIComponent(document.getElementById('appliedat_SiteName').value),
        "job_url=" + encodeURIComponent(document.getElementById('appliedat_Url').value),
        "description=" + encodeURIComponent(document.getElementById('appliedat_Description').value),
        "notes=" + encodeURIComponent(document.getElementById('appliedat_Notes').value),
        "applied=" + applied,
        "reminder=" + encodeURIComponent(document.getElementById('appliedat_reminderDate').value)
      ].join("&");
      xmlhttp.open("POST", authUrl, true);
      xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xmlhttp.send(authData);
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          console.log(xmlhttp.responseText);
          var o = JSON.parse(xmlhttp.responseText);
          alert(o.output);
          document.getElementById('appliedat-wrapper').style.display = 'none';
        }
      }
      return false;
  }
};
chrome.runtime.sendMessage({
  type : "getLogins"
}, function (response) {
  haveLogins = response.haveLogins;
  User = response.User;
  Pass = response.Pass;
  CreateBox();
  if (!haveLogins) {
      document.querySelector('#appliedat-wrapper .main .login').style.display='block';
      document.querySelector('#appliedat-wrapper .main .content').style.display='none';
    }
});
chrome.extension.onMessage.addListener(
  function (resonseMsg, sender, sendResponse) {
  if (resonseMsg.show == true) {
    var isjobSite = false;
    var description = '';
    var longLine = '\n---------------------------------------------------------------------------------------\n';
    // craiglist.org
    if (document.domain.indexOf('craigslist.org') != -1) {
      if (document.querySelector('#postingbody') && document.querySelector('.cltags')) {
        isjobSite = true;
        description = document.querySelector('#postingbody').innerText.trim() + longLine +
          'TAGS:-\n' + document.querySelector('.cltags').innerText.trim();
      }
    }
    // idealist.org
    if (document.domain.indexOf('idealist.org') != -1) {
      if (document.getElementById('box-Jobdescription') && document.getElementById('box-Howtoapply') &&
        document.getElementById('box-Location') && document.getElementById('box-Details')) {
        isjobSite = true;
        description = document.getElementById('box-Jobdescription').innerText.trim() + longLine +
          document.getElementById('box-Howtoapply').innerText.trim() + longLine +
          document.getElementById('box-Location').innerText.trim() + longLine +
          document.getElementById('box-Details').innerText.trim();
      }
    }
    // indeed.com
    if (document.domain.indexOf('indeed.com') != -1) {
      if (document.querySelector('#job_header') && document.querySelector('#job_header+table')) {
        isjobSite = true;
        description = document.querySelector('#job_header').innerText.trim() + longLine +
          document.querySelector('#job_header+table').innerText.trim();
      }
    }
    // USAJOBS.org TODO Need to Grab the JobTitle in the header
    if (document.domain.indexOf('usajobs.gov') != -1) {
      if (document.querySelector('#jobinfo1') && document.querySelector('#jobinfo2') &&
        document.querySelector('#jobsummary') && document.querySelector('#keyrequirements') && 
        document.querySelector('#duties') && document.querySelector('#qualifications') &&
        document.querySelector('#requireddocuments') && document.querySelector('#agencycontact')) {
        isjobSite = true;
        description = document.querySelector('#jobinfo1').innerText.trim() + longLine +
          document.querySelector('#jobinfo2').innerText.trim() + longLine +
          document.querySelector('#jobsummary').innerText.trim() + longLine +
          document.querySelector('#keyrequirements').innerText.trim() + longLine +
          document.querySelector('#duties').innerText.trim() + longLine +
          document.querySelector('#qualifications').innerText.trim() + longLine +
          document.querySelector('#requireddocuments').innerText.trim() + longLine +
          document.querySelector('#agencycontact').innerText.trim();
      }
    }
    // Monster.com TODO Add more support
    if (document.domain.indexOf('jobview.monster.com') != -1) {
      if (document.getElementById('jobcopy') && document.getElementById('jobBodyContent') &&
        document.getElementById('jobsummary')) {
        isjobSite = true;
        description = document.getElementById('jobcopy').innerText.trim() + longLine +
          document.getElementById('jobBodyContent').innerText.trim() + longLine +
          document.getElementById('jobsummary').innerText.trim();
      }

      if (document.querySelector('table')) {
        isjobSite = true;
        description = document.querySelector('table').innerText.trim();
      }
    }
    // bright.com
    if (document.domain.indexOf('bright.com') != -1) {
      if  (document.querySelector('.company-details') && document.querySelector('.job-details') && 
        document.getElementById('job-description')) {
        isjobSite = true;
        description = document.querySelector('.company-details').innerText.trim() + longLine +
        document.querySelector('.job-details').innerText.trim() + longLine +
        document.getElementById('job-description').innerText.trim();
      }
    }
    // glassdoor.com
    if (document.domain.indexOf('glassdoor.com') != -1) {
      if (document.querySelector('.desc')) {
        isjobSite = true;
        description = document.querySelector('.desc').innerText.trim();
      }
    }
    // linkedin.com
    if (document.domain.indexOf('linkedin.com') != -1) {
      if (document.querySelector('.job-description') && document.querySelector('.job-skills') && 
        document.querySelector('.company-description') && document.querySelector('.additional-info')) {
        isjobSite = true;
        description = document.querySelector('.job-description').innerText.trim() + longLine +
          document.querySelector('.job-skills').innerText.trim() + longLine +
          document.querySelector('.company-description').innerText.trim() + longLine +
          document.querySelector('.additional-info').innerText.trim();
      }
      if (document.querySelector('.job-description') && document.querySelector('.additional-info')) {
        isjobSite = true;
        description = document.querySelector('.job-description').innerText.trim() + longLine +
          document.querySelector('.additional-info').innerText.trim();
      }
      if (document.querySelector('.job-description') && document.querySelector('.company-description') 
        && document.querySelector('.additional-info')) {
        isjobSite = true;
        description = document.querySelector('.job-description').innerText.trim() + longLine +
          document.querySelector('.company-description').innerText.trim() + longLine +
          document.querySelector('.additional-info').innerText.trim();
      }
    }
    // TheLadders.com
    if (document.domain.indexOf('theladders.com') != -1) {
      if (document.querySelector('.shiftDown')) {
        isjobSite = true;
        description = document.querySelector('.shiftDown').innerText.trim();
      }
    }
    // snagajob.com
    if (document.domain.indexOf('snagajob.com') != -1) {
      if (document.querySelector('.jobDescription')) {
        isjobSite = true;
        description = document.querySelector('.jobDescription').innerText.trim();
      }
    }
    // ziprecruiter.com
    if (document.domain.indexOf('ziprecruiter.com') != -1) {
      if (document.querySelector('.jobDescription')) {
        isjobSite = true;
        description = document.querySelector('.jobDescription').innerText.trim();
      }
    }
    // dice.com
    if (document.domain.indexOf('dice.com') != -1) {
      if (document.location.href.indexOf('/job/result/') != -1) {
        if (document.getElementById('jobOverview') && document.getElementById('detailDescription') &&
          document.getElementById('contactInfo')) {
          isjobSite = true;
          description = document.getElementById('jobOverview').innerText.trim() + longLine +
            document.getElementById('detailDescription').innerText.trim() + longLine +
            document.getElementById('contactInfo').innerText.trim() + longLine;
        }
      } 
      if (document.location.href.indexOf('jobsearch/servlet') != -1) {
        if (document.querySelector('.job_overview') && document.querySelector('.contact_info') &&
          document.querySelector('.job_description')) {
          isjobSite = true;
          description = document.querySelector('.job_description').innerText.trim() + longLine +
            document.querySelector('.job_overview').innerText.trim() + longLine +
            document.querySelector('.contact_info').innerText.trim() + longLine;
        }
      }

    }
  if (!isjobSite) {
     // do extra magic to tell user we don't support this yet
      document.querySelector('#appliedat-wrapper .header').setAttribute('style', 'border-width: 3px; border-color:red; border-bottom: 1px solid #C3D4DB');
      document.querySelector('#appliedat-wrapper .main').setAttribute('style', 'border-width: 3px; border-color:red;');
      document.querySelector('#appliedat-wrapper .footer').setAttribute('style', 'border-width: 3px; border-color:red; border-top: 1px solid #C3D4DB');
      document.getElementById('appliedat_Description').style.color='red';
      description = "We don't support this site yet, so ENTER (copy and paste) the description on your own......"; 
    } 
    var d = new Date();
    document.getElementById('appliedat_SiteName').value = document.title;
    document.getElementById('appliedat_SaveDate').value = d.toGMTString();
    document.getElementById('appliedat_Url').value = location.href;
    document.getElementById('appliedat_Description').value = description;
    document.getElementById('appliedat_Notes').value = '';
    var reminder = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
    //;+ " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    document.getElementById('appliedat_reminderDate').value = reminder;
    document.getElementById('appliedat-wrapper').style.display = 'block';
  }
});
