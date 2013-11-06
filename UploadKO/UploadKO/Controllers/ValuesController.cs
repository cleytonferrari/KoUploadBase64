using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace UploadKO.Controllers
{
    public class ValuesController : ApiController
    {
        public HttpResponseMessage Put(int id, ImagemDto dto)
        {
            var imagem = dto.Image;
            var imageType = dto.ImageType;
            //agora so salvar essas informações em algum lugar!!!

            //no exemplo eu retorno o dto, para usar no retorno do ajax
            return Request.CreateResponse(HttpStatusCode.OK, dto);
        }

    }


    public class ImagemDto
    {
        public string ImageType { get; set; }

        public byte[] Image { get; set; }
    }

}
