using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Contoso.Plugins
{
    public class ContactManager : PluginImplement
    {
        public override void ExecutePlugin(IServiceProvider serviceProvider)
        {
            Entity contato = (Entity)this.Context.InputParameters["Target"];

            QueryExpression recuperarEmails = new QueryExpression("contact");
            recuperarEmails.Criteria.AddCondition("emailaddress1", ConditionOperator.Equal, contato["emailaddress1"]);
            EntityCollection emailsRecuperados = this.Service.RetrieveMultiple(recuperarEmails);

            if(emailsRecuperados.Entities.Count > 0)
            {
                throw new InvalidPluginExecutionException("Contato já cadastrado.");
            }
        }
    }
}
