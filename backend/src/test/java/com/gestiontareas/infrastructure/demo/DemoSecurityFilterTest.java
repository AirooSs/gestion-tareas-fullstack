package com.gestiontareas.infrastructure.demo;
import com.gestiontareas.domain.port.out.DemoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
class DemoSecurityFilterTest {
 @Test void sessionCreationIsRateLimited() throws Exception {
  var filter=new DemoSecurityFilter(mock(DemoRepository.class),10,1);
  var first=new MockHttpServletRequest("POST","/api/demo/session"); first.setRemoteAddr("127.0.0.1");
  var second=new MockHttpServletRequest("POST","/api/demo/session"); second.setRemoteAddr("127.0.0.1");
  var firstResponse=new MockHttpServletResponse(); var secondResponse=new MockHttpServletResponse();
  filter.doFilter(first,firstResponse,new MockFilterChain()); filter.doFilter(second,secondResponse,new MockFilterChain());
  assertEquals(200,firstResponse.getStatus()); assertEquals(429,secondResponse.getStatus()); assertEquals("60",secondResponse.getHeader("Retry-After"));
 }
 @Test void rejectsOversizedBody() throws Exception {
  var filter=new DemoSecurityFilter(mock(DemoRepository.class),10,10);
  var request=new MockHttpServletRequest("POST","/api/demo/session"); request.setContent(new byte[8193]);
  var response=new MockHttpServletResponse(); filter.doFilter(request,response,new MockFilterChain());
  assertEquals(413,response.getStatus());
 }

}
