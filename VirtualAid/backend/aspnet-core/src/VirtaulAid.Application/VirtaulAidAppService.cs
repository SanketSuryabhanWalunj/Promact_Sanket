using System;
using System.Collections.Generic;
using System.Text;
using VirtaulAid.Localization;
using Volo.Abp.Application.Services;

namespace VirtaulAid;

/* Inherit your application services from this class.
 */
public abstract class VirtaulAidAppService : ApplicationService
{
    protected VirtaulAidAppService()
    {
        LocalizationResource = typeof(VirtaulAidResource);
    }
}
