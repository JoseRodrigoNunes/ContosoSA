if (typeof (Contoso) == "undefined") {
    Contoso = { __namespace: true };
}

Contoso.contato = {
    _VerificarDuplicidadeEmail: function(executionContext){
        var formContext = executionContext.getFormContext();
        var email = formContext.getAttribute("emailaddress1").getValue();
        Xrm.WebApi.online.retrieveMultipleRecords("contact", "?$select=emailaddress1&$filter=emailaddress1 eq '" + email + "'").then(
            function success(results) {
                console.log(results);
                if(results.entities.length > 0) {
                    var result = results.entities[0];
                    // Columns
                    var contactid = result["contactid"]; // Guid
                    var emailaddress1 = result["emailaddress1"]; // Text
                    console.log("GUID:" + contactid + " | E-mail:"+ emailaddress1);
                    Contoso.contato.DynamicsAlert("Por favor, verifique se esse contato já não possui cadastro ou se o E-mail foi digitado corretamente.","E-mail '" + emailaddress1 +"' já cadastrado!");
                }
            },
            function(error) {
                console.log(error.message);
            }
        )
    },
    DynamicsAlert: function (alertText, alertTitle) {
        var alertStrings = {
            confirmButtonLabel: "OK",
            text: alertText,
            title: alertTitle
        };

        var alertOptions = {
            heigth: 120,
            width: 200
        };

        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
    }
}