if (typeof (Contoso) == "undefined") {
    Contoso = { __namespace: true };
}

Contoso.clienteEmPotencial = {
    _OnLoad: function(executionContext){
        var formContext = executionContext.getFormContext();
        formContext.getControl("header_process_parentcontactid").setDisabled(true);
        formContext.getControl("header_process_parentaccountid").setDisabled(true);
    },

    _PreencherContatoExistente: function(executionContext){
        var formContext = executionContext.getFormContext();
        var email = formContext.getAttribute("emailaddress1").getValue();
        Xrm.WebApi.online.retrieveMultipleRecords("contact", "?$select=telephone1,emailaddress1,firstname,fullname,jobtitle,lastname,mobilephone&$filter=emailaddress1 eq '" + email + "'").then(
            function success(results) {
                console.log(results);
                if(results.entities.length > 0) {
                    var result = results.entities[0];
                    // Columns
                    var contactid = result["contactid"]; // Guid
                    var emailaddress1 = result["emailaddress1"]; // Text
                    var fullname = result["fullname"]; // Text
                    console.log("GUID:" + contactid + " | E-mail:"+ emailaddress1 + " | Fullname:"+ fullname);
                    var lookupContato = new Array();
                    lookupContato[0] = new Object();
                    lookupContato[0].id = contactid;
                    lookupContato[0].name = fullname;
                    lookupContato[0].entityType = "contact"
                    formContext.getAttribute("parentcontactid").setValue(lookupContato);
                    formContext.getAttribute("firstname").setValue(result["firstname"]);
                    formContext.getAttribute("lastname").setValue(result["lastname"]);
                    formContext.getAttribute("telephone1").setValue(result["telephone1"]);
                    formContext.getAttribute("jobtitle").setValue(result["jobtitle"]);
                    formContext.getAttribute("mobilephone").setValue(result["mobilephone"]);
                }
                else{
                    formContext.getAttribute("parentcontactid").setValue("");
                }
            },
            function(error) {
                console.log(error.message);
            }
        )
    },

    _PreencherContaExistente: function(executionContext){
        var formContext = executionContext.getFormContext();
        var cnpj = formContext.getAttribute("jrl_lead_cnpj").getValue();
        
        if(Contoso.clienteEmPotencial.ValidarCNPJ(cnpj)){
            var cnpjFormatado = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
            Xrm.WebApi.online.retrieveMultipleRecords("account", "?$select=accountid,name,address1_city,address1_country,address1_stateorprovince,address1_line1,address1_line2,address1_line3,address1_postalcode,jrl_cnpj,websiteurl&$filter=jrl_cnpj eq '" + cnpjFormatado + "'").then(
                function success(results) {
                console.log(results);
                if(results.entities.length > 0) {
                    var result = results.entities[i];
                    // Columns
                    var accountid = result["accountid"]; // Guid
                    var name = result["name"]; // Text
                    var jrl_cnpj = result["jrl_cnpj"]; // Text
                    console.log("Nome da empresa:" + name + "| CNPJ:" + jrl_cnpj)
                    var lookupConta = new Array();
                    lookupConta[0] = new Object();
                    lookupConta[0].id = accountid;
                    lookupConta[0].name = name;
                    lookupConta[0].entityType = "account"
                    formContext.getAttribute("parentaccountid").setValue(lookupConta);
                    formContext.getAttribute("companyname").setValue(name);
                    formContext.getAttribute("websiteurl").setValue(result["websiteurl"]);
                    formContext.getAttribute("address1_line1").setValue(result["address1_line1"]);
                    formContext.getAttribute("address1_line2").setValue(result["address1_line2"]);
                    formContext.getAttribute("address1_line3").setValue(result["address1_line3"]);
                    formContext.getAttribute("address1_city").setValue(result["address1_city"]);
                    formContext.getAttribute("address1_stateorprovince").setValue(result["address1_stateorprovince"]);
                    formContext.getAttribute("address1_postalcode").setValue(result["address1_postalcode"]);
                    formContext.getAttribute("address1_country").setValue(result["address1_country"]);
                }
                else{
                    formContext.getAttribute("jrl_lead_cnpj").setValue(cnpjFormatado);
                    formContext.getAttribute("parentaccountid").setValue("");
                }
            },
            function(error) {
                console.log(error.message);
            }
            )
        }
        else {
            Contoso.conta.DynamicsAlert("Por favor, digite um CNPJ válido neste campo e tente novamente.", "CNPJ inválido!");
        }
    },

    ValidarCNPJ: function (cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, '');

        if (cnpj == '') return false;

        if (cnpj.length != 14)
            return false;

        // Elimina CNPJs invalidos conhecidos
        if (cnpj == "00000000000000" ||
            cnpj == "11111111111111" ||
            cnpj == "22222222222222" ||
            cnpj == "33333333333333" ||
            cnpj == "44444444444444" ||
            cnpj == "55555555555555" ||
            cnpj == "66666666666666" ||
            cnpj == "77777777777777" ||
            cnpj == "88888888888888" ||
            cnpj == "99999999999999")
            return false;

        // Valida DVs
        tamanho = cnpj.length - 2
        numeros = cnpj.substring(0, tamanho);
        digitos = cnpj.substring(tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return false;

        return true;
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

