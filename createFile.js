var fso  = new ActiveXObject("Scripting.FileSystemObject"); 
   var fh = fso.CreateTextFile("c:\\Test.txt", true); 
   fh.WriteLine("Some text goes here..."); 
   fh.Close(); 