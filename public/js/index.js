(function() {
  $(function() {
    var $start, tour;
    $start = $("#start");
    tour = new Tour({
      onStart: function() {
        return $start.addClass("disabled", true);
      },
      onEnd: function() {
        return $start.removeClass("disabled", true);
      },
      debug: true
    });
    tour.addSteps([
      {
        element: "#welcome",
        placement: "top",
        title: "Global eHealth Declaration",
        content: "<p>Introducing Global eHealth Declaration Solution by walking through it step by step.</p><p>Coronavirus disease (COVID-19) is an infectious disease that causes respiratory illness (like the flu) with symptoms such as a cough, fever, and in more severe cases, difficulty breathing.</p><p>Most effective way to prevent infections and save lives is breaking the chains of transmission, and to do that, we must collect information from the community or our sorrounding people.</p>",
      }, {
        element: "#loginform",
        placement: "top",
        title: "Entity Sign In",
        content: "Registered authorized personal can use credentials emailed individually as part of registration process.",
        options: {
          labels: {
            prev: "Welcome",
            next: "Sign UP",
            end: "Stop"
          }
        }
      }, {
        element: "#signUp",
        placement: "top",
        title: "Entity Onboarding",
        content: "<p>Who should use this?" +"</p><p>Organizations, Office, Office Building Entrance, F&B, Malls and Retails, Events & Activities, can register themselves absolutely free.</p>",
        reflex: true
      }
      
    ]);
    tour.start();
    if (tour.ended()) {
      $('<div class="alert"><button class="close" data-dismiss="alert">&times;</button>You ended the Global eHealth Declaration Solution tour. <a href="#" class="start">Restart the tour.</a></div>').prependTo(".content").alert();
    }
    $(document).on("click", ".start", function(e) {
      e.preventDefault();
      if ($(this).hasClass("disabled")) {
        return false;
      }
      tour.restart();
      return $(".alert").alert("close");
    });
    return $("html").smoothScroll();
  });

}).call(this);
